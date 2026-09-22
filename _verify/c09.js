const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const repo = path.join(__dirname, '..', 'C09');
const port = 18782;

function req(method, urlPath, payload) {
  return new Promise((resolve, reject) => {
    const body = payload === undefined ? null : JSON.stringify(payload);
    const request = http.request({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: body ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      } : {},
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsed = null;
        try { parsed = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    request.on('error', reject);
    if (body) request.write(body);
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
    let rooms = null;
    for (let i = 0; i < 40; i += 1) {
      try {
        rooms = await req('GET', '/rooms');
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
    }
    if (!rooms) throw new Error('server did not start\n' + stderr);

    assert(rooms.status === 200 && rooms.body.length === 3 && rooms.body[0].capacity === 4, 'rooms');
    const bookings = await req('GET', '/bookings');
    assert(bookings.status === 200 && bookings.body.length === 10, 'bookings');
    assert((await req('GET', '/nope')).status === 404, 'unknown 404');

    const missingRoom = await req('POST', '/book', {
      room_id: 99, date: '2026-09-23', start: '07:00', end: '06:00', attendees: 0,
    });
    assert(missingRoom.status === 404 && missingRoom.body.error === 'Room not found', 'room before other checks');

    const zero = await req('POST', '/book', {
      room_id: 1, date: '2026-09-23', start: '10:00', end: '11:00', attendees: 0,
    });
    assert(zero.status === 422 && zero.body.error === 'Room capacity exceeded', 'zero attendees');

    const tooMany = await req('POST', '/book', {
      room_id: 1, date: '2026-09-23', start: '07:00', end: '06:00', attendees: 99,
    });
    assert(tooMany.status === 422 && tooMany.body.error === 'Room capacity exceeded', 'capacity before hours');

    const hours = await req('POST', '/book', {
      room_id: 2, date: '2026-09-23', start: '07:30', end: '07:00', attendees: 1,
    });
    assert(hours.status === 422 && hours.body.error === 'Outside opening hours', 'hours before range');

    const range = await req('POST', '/book', {
      room_id: 2, date: '2026-09-30', start: '10:00', end: '10:00', attendees: 1,
    });
    assert(range.status === 422 && range.body.error === 'Invalid time range', 'equal end is invalid');

    const lateEnd = await req('POST', '/book', {
      room_id: 3, date: '2026-09-23', start: '18:00', end: '20:01', attendees: 1,
    });
    assert(lateEnd.status === 422 && lateEnd.body.error === 'Outside opening hours', 'hours before overlap');

    const clash = await req('POST', '/book', {
      room_id: 1, date: '2026-09-23', start: '10:30', end: '11:30', attendees: 2,
    });
    assert(clash.status === 409 && clash.body.error === 'Time slot conflicts with booking 7', 'first clash id');

    const touchStart = await req('POST', '/book', {
      room_id: 1, date: '2026-09-23', start: '09:00', end: '10:00', attendees: 2,
    });
    assert(touchStart.status === 201 && touchStart.body.data.id === 11, 'touch at start is allowed');

    const touchEnd = await req('POST', '/book', {
      room_id: 1, date: '2026-09-23', start: '12:00', end: '13:00', attendees: 2,
    });
    assert(touchEnd.status === 201 && touchEnd.body.data.id === 12, 'touch at end is allowed');

    const again = await req('POST', '/book', {
      room_id: '1', date: '2026-09-23', start: '12:00', end: '13:00', attendees: 2,
    });
    assert(again.status === 409 && again.body.error === 'Time slot conflicts with booking 12', 'new id participates');

    const full = await req('POST', '/book', {
      room_id: 1, date: '2026-09-23', start: '13:00', end: '14:00', attendees: 4,
    });
    assert(full.status === 201 && full.body.data.attendees === 4, 'capacity inclusive');

    const over = await req('POST', '/book', {
      room_id: 1, date: '2026-09-23', start: '15:00', end: '16:00', attendees: 5,
    });
    assert(over.status === 422 && over.body.error === 'Room capacity exceeded', 'one over capacity');

    const day = await req('POST', '/book', {
      room_id: 2, date: '2026-09-30', start: '08:00', end: '20:00', attendees: 1,
    });
    assert(day.status === 201, 'full opening window');

    const listed = await req('GET', '/bookings');
    assert(listed.body.some((item) => item.id === 11), 'new booking is visible');

    console.log('C09 PASS');
  } finally {
    child.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
