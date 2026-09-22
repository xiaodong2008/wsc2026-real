const http = require('http');
const fs = require('fs');
const path = require('path');

// Plain Node http. Do not require('express') or any other package.
// total is the filtered count, never the raw 27, once search is active.
// total_pages is at least 1, even when nothing matches.
// A page past the end is still 200 with data: [].

const JOBS_PATH = path.join(__dirname, 'data', 'jobs.json');
const PER_PAGE = 10;

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');

  if (req.method === 'GET' && url.pathname === '/jobs') {
    const jobs = JSON.parse(fs.readFileSync(JOBS_PATH, 'utf8'));
    const q = (url.searchParams.get('search') || '').trim().toLowerCase();
    const filtered = q
      ? jobs.filter((job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q))
      : jobs;

    let page = parseInt(url.searchParams.get('page'), 10);
    if (!Number.isFinite(page) || page < 1) page = 1;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const data = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return send(res, 200, {
      data,
      meta: {
        total,
        page,
        per_page: PER_PAGE,
        total_pages: totalPages,
      },
    });
  }

  send(res, 404, { error: 'Not found' });
});

const port = Number(process.env.PORT) || 80;
server.listen(port, '0.0.0.0');
