const http = require('http');
const fs = require('fs');
const path = require('path');

const JOBS_PATH = path.join(__dirname, 'data', 'jobs.json');

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
    return send(res, 200, jobs);
  }

  send(res, 404, { error: 'Not found' });
});

const port = Number(process.env.PORT) || 80;
server.listen(port, '0.0.0.0');
