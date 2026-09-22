const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const repo = path.join(__dirname, '..', 'C08');
const port = 18781;

function req(urlPath) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method: 'GET',
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let body = null;
        try { body = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, body, type: res.headers['content-type'] || '' });
      });
    });
    request.on('error', reject);
    request.end();
  });
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function main() {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: repo,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });

  try {
    let ready = null;
    for (let i = 0; i < 40; i += 1) {
      try {
        ready = await req('/jobs');
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
    }
    if (!ready) throw new Error('server did not start\n' + stderr);

    assert(ready.status === 200, 'list status');
    assert(ready.type.includes('application/json'), 'json content type');
    assert(ready.body.meta.total === 27, 'total 27');
    assert(ready.body.meta.page === 1 && ready.body.meta.per_page === 10, 'default meta');
    assert(ready.body.meta.total_pages === 3, 'total_pages 3');
    assert(ready.body.data.length === 10 && ready.body.data[0].id === 1 && ready.body.data[9].id === 10, 'page 1 ids');
    assert(ready.body.data[0].salary === 68000, 'salary passes through');

    const page3 = await req('/jobs?page=3');
    assert(page3.body.data.length === 7 && page3.body.data[0].id === 21 && page3.body.data[6].id === 27, 'page 3');

    const page4 = await req('/jobs?page=4');
    assert(page4.status === 200 && page4.body.data.length === 0, 'out of range data');
    assert(page4.body.meta.total === 27 && page4.body.meta.total_pages === 3 && page4.body.meta.page === 4, 'out of range meta');

    for (const bad of ['0', '-3', 'abc', '']) {
      const res = await req('/jobs?page=' + encodeURIComponent(bad));
      assert(res.body.meta.page === 1 && res.body.data[0].id === 1, 'bad page ' + bad);
    }

    const engineer = await req('/jobs?search=ENGINEER');
    assert(engineer.body.meta.total === 5, 'engineer total');
    assert(engineer.body.data.map((job) => job.id).join(',') === '1,2,3,4,7', 'engineer ids');

    const orbit = await req('/jobs?search=orbit');
    assert(orbit.body.data.map((job) => job.id).join(',') === '5,6,7', 'orbit matches title or company');

    const lantern = await req('/jobs?search=LANTERN');
    assert(lantern.body.data.map((job) => job.id).join(',') === '7,8,9', 'company substring');

    const guide = await req('/jobs?search=guide&page=2');
    assert(guide.body.meta.total === 12 && guide.body.meta.total_pages === 2, 'filtered meta');
    assert(guide.body.data.map((job) => job.id).join(',') === '20,21', 'filtered page 2');

    const none = await req('/jobs?search=zzz');
    assert(none.status === 200 && none.body.data.length === 0, 'empty data');
    assert(none.body.meta.total === 0 && none.body.meta.total_pages === 1 && none.body.meta.page === 1, 'empty meta min 1');

    const missing = await req('/no-such');
    assert(missing.status === 404, 'unknown route');

    console.log('C08 PASS');
  } finally {
    child.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
