// Plain Node does not read .env on its own the way Laravel or Next.js do. It is
// loaded by `node --env-file-if-exists=.env` (see the start script and
// docker-entrypoint.sh) rather than a library. In the container the entrypoint
// copies .env.prod over .env first, so this picks up the deployed configuration;
// locally it picks up your own .env.
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')

// MySQL over TCP. DATABASE_URL must be a mysql://user:password@host:port/dbname
// connection string — set it in .env locally; the competition platform writes it
// into .env.prod for the deployed app. The entrypoint runs `prisma migrate deploy`
// against it before the server starts.
//
// This is the ONLY source of the connection: nothing is hardcoded here, in the
// Dockerfile or in docker-compose.yml.
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // Deliberately not fatal. Exiting here would leave nothing listening, and the
  // platform would report only "container failed to start and listen on the
  // port" — which sends you looking at ports instead of at configuration.
  console.error(
    'DATABASE_URL is not set. The app will start, but every database query will fail. ' +
      'Expected e.g. mysql://user:password@host:3306/dbname'
  )
}

const adapter = new PrismaMariaDb(databaseUrl || 'mysql://placeholder:placeholder@placeholder:3306/placeholder')
const prisma = new PrismaClient({ adapter })

const app = express()
const PORT = process.env.PORT || 80

app.use(express.json())

async function getTasks() {
  // No configuration means no server to reach. Skipping the query avoids a
  // ~10s connection-pool timeout on every request, so the page renders the
  // hint below immediately instead of appearing to hang.
  if (!databaseUrl) return null

  try {
    return await prisma.task.findMany({ orderBy: { id: 'asc' } })
  } catch (e) {
    return null // database unavailable
  }
}

async function seed() {
  if (!databaseUrl) return

  try {
    if ((await prisma.task.count()) === 0) {
      await prisma.task.createMany({
        data: [
          { title: 'Read the brief', done: true },
          { title: 'Build the app', done: false },
        ],
      })
    }
  } catch (e) {
    console.error('seed skipped (database not ready):', e.message)
  }
}

// Database connection check.
//
//   GET /api/db-check  → 200 {"ok":true,  ...}   connection works
//                      → 503 {"ok":false, ...}   it does not, and why
//
// An expert can confirm the credentials work without reading any code:
//
//   curl -fsS http://localhost/api/db-check
//
// The 503 makes `curl -f` exit non-zero, so a whole room can be swept in one
// loop. Every WSC2026 template answers the same check in the same shape.
//
// The probe uses the MySQL driver directly rather than Prisma, for one reason:
// Prisma answers every connection problem with the same "pool timeout after
// 10000ms", which hides whether the password was wrong or the host unreachable.
// The driver says ER_ACCESS_DENIED_ERROR or ENOTFOUND in about a millisecond.
// Whether Prisma itself works is answered by /api/tasks.
const mariadb = require('mariadb')

// Describe the connection WITHOUT its password, so a failure says which
// database was unreachable and a success cannot leak a credential.
function describeConnection() {
  if (!databaseUrl) return { driver: 'mysql', host: null, port: null, database: null, user: null }
  try {
    const u = new URL(databaseUrl)
    return {
      driver: 'mysql',
      host: u.hostname,
      port: Number(u.port) || 3306,
      database: decodeURIComponent(u.pathname.replace(/^\//, '')) || null,
      user: decodeURIComponent(u.username) || null,
    }
  } catch {
    return { driver: 'mysql', host: null, port: null, database: null, user: null }
  }
}

const CONFIG_HINT =
  'Local development: cp .env.example .env. Deployed: the platform writes .env.prod, ' +
  'which the entrypoint copies over .env at startup.'
const CONNECTION_HINT =
  'Check DATABASE_URL in .env (local) or .env.prod (deployed). ER_ACCESS_DENIED_ERROR means ' +
  'wrong credentials; ENOTFOUND or ECONNREFUSED means the host, port or network is wrong.'

app.get('/api/db-check', async (req, res) => {
  const base = describeConnection()

  if (!databaseUrl) {
    return res.status(503).json({ ...base, ok: false, error: 'DATABASE_URL is not set', hint: CONFIG_HINT })
  }

  // The build-time placeholder is a connection string in shape only — it exists
  // so `prisma generate` can run before any credentials do. Seeing it at runtime
  // means .env never reached the process, which is worth saying outright rather
  // than reporting a baffling DNS failure for a host called "placeholder".
  if (databaseUrl.includes('placeholder')) {
    return res.status(503).json({
      ...base,
      ok: false,
      error: 'DATABASE_URL is still the build-time placeholder',
      hint: 'The real value never reached the process. ' + CONFIG_HINT,
    })
  }

  let connection
  try {
    const started = Date.now()
    // The driver speaks mariadb://; the adapter rewrites the scheme internally
    // too. allowPublicKeyRetrieval turns MySQL 8's "RSA public key is not
    // available" into the plain ER_ACCESS_DENIED_ERROR it actually is.
    connection = await mariadb.createConnection(
      databaseUrl.replace(/^mysql:/, 'mariadb:') + '?connectTimeout=5000&allowPublicKeyRetrieval=true',
    )

    // A real round trip, not just "the client object was constructed".
    const [{ version }] = await connection.query('SELECT VERSION() AS version')
    const latency = Date.now() - started

    // Asked separately, so the check still passes on a correctly configured but
    // not-yet-migrated database: working credentials and a present schema are
    // two different questions.
    const [{ found }] = await connection.query(
      'SELECT COUNT(*) AS found FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
      [base.database, 'express_tasks'],
    )

    res.json({
      ...base,
      ok: true,
      server_version: version,
      latency_ms: latency,
      demo_table: Number(found) === 1 ? 'express_tasks present' : 'express_tasks missing',
    })
  } catch (e) {
    res.status(503).json({
      ...base,
      ok: false,
      error: e.message,
      code: e.code || null,
      hint: CONNECTION_HINT,
    })
  } finally {
    // Never leave the probe's connection behind; it is not part of the app pool.
    if (connection) await connection.end().catch(() => {})
  }
})

// JSON API
app.get('/api/tasks', async (req, res) => {
  const tasks = await getTasks()
  if (!tasks) return res.status(503).json({ framework: 'Express', version: '5.2.1', error: 'database unavailable' })
  res.json({ framework: 'Express', version: '5.2.1', orm: 'Prisma 7.3.0', tasks })
})

app.post('/api/tasks', async (req, res) => {
  const title = (req.body && req.body.title) || 'Untitled'
  try {
    const task = await prisma.task.create({ data: { title } })
    res.status(201).json(task)
  } catch (e) {
    res.status(503).json({ error: 'database unavailable' })
  }
})

// Server-rendered home page
app.get('/', async (req, res) => {
  const tasks = await getTasks()
  const hint = databaseUrl
    ? `<p>⚠️ Database not available. Start with <code>docker compose up --build</code>.</p>`
    : `<p>⚠️ <code>DATABASE_URL</code> is not set. Copy <code>.env.example</code> to <code>.env</code>, or check <code>.env.prod</code> for the deployed app.</p>`
  const body = tasks
    ? `<ul>${tasks.map(t => `<li>${t.done ? '✅' : '⬜️'} ${t.title}</li>`).join('')}</ul>`
    : hint
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WSC2026 · Express 5.2.1</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; display: grid; place-items: center; min-height: 100vh; background: #0b1020; color: #e7ecff; }
    .card { background: #151c33; padding: 2.5rem 3rem; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,.4); max-width: 32rem; }
    h1 { margin: 0 0 .25rem; }
    .v { color: #7c9cff; font-weight: 600; }
    ul { line-height: 1.9; padding-left: 1.2rem; }
    code { background: #0b1020; padding: .15rem .4rem; border-radius: 6px; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Express <span class="v">5.2.1</span></h1>
    <p>WSC2026 Web Technologies — minimal back-end app, tasks stored with Prisma 7.3.0 (MySQL).</p>
    ${body}
    <p>JSON API: <code>GET /api/tasks</code> — connection check: <code><a href="/api/db-check">/api/db-check</a></code></p>
  </main>
</body>
</html>`)
})

// Bind the port immediately so the container stays up even if the DB is unreachable.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express 5.2.1 app listening on http://0.0.0.0:${PORT}`)
})

seed()
