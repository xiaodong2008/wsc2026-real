const http = require('http');
const fs = require('fs');
const path = require('path');

// Plain Node http. Do not require('express') or any other package.
// Validate in this order. The first failure is the whole mark:
//   1. room exists            404 Room not found
//   2. capacity               422 Room capacity exceeded
//   3. opening hours          422 Outside opening hours
//   4. end strictly after start  422 Invalid time range
//   5. overlap, touching ok   409 Time slot conflicts with booking <id>
//   6. 201 { data: booking }  id = max existing id + 1
// Error field name: match the starter's 404. This reference uses "error".

const rooms = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'rooms.json'), 'utf8'));
const bookings = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'bookings.json'), 'utf8'));

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');

  if (req.method === 'GET' && url.pathname === '/rooms') {
    return send(res, 200, rooms);
  }

  if (req.method === 'GET' && url.pathname === '/bookings') {
    return send(res, 200, bookings);
  }

  if (req.method === 'POST' && url.pathname === '/book') {
    const body = await readBody(req);

    const room = rooms.find((item) => String(item.id) === String(body.room_id));
    if (!room) return send(res, 404, { error: 'Room not found' });

    if (!(body.attendees >= 1 && body.attendees <= room.capacity)) {
      return send(res, 422, { error: 'Room capacity exceeded' });
    }

    if (!(body.start >= '08:00' && body.end <= '20:00')) {
      return send(res, 422, { error: 'Outside opening hours' });
    }

    if (!(body.end > body.start)) {
      return send(res, 422, { error: 'Invalid time range' });
    }

    const clash = bookings.find((item) =>
      String(item.room_id) === String(body.room_id) &&
      item.date === body.date &&
      body.start < item.end &&
      item.start < body.end
    );
    if (clash) {
      return send(res, 409, { error: `Time slot conflicts with booking ${clash.id}` });
    }

    const id = Math.max(0, ...bookings.map((item) => Number(item.id))) + 1;
    const booking = {
      id,
      room_id: body.room_id,
      date: body.date,
      start: body.start,
      end: body.end,
      attendees: body.attendees,
    };
    bookings.push(booking);
    return send(res, 201, { data: booking });
  }

  return send(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(() => {
    if (!res.headersSent) send(res, 400, { error: 'Invalid JSON' });
  });
});

const port = Number(process.env.PORT) || 80;
server.listen(port, '0.0.0.0');
