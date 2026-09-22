# 考场粘贴

每一段都能直接贴。标题就是搜索词。

## A12 半径塌了

`.a3d` 上不能有 `overflow: hidden`。不要写死 `30deg`、`12` 或半径。`perspective` 写在父元素上。

```css
html, body { height: 100%; margin: 0; overflow: hidden; }
body { display: grid; place-items: center; perspective: 1200px; }

.a3d {
  --w: 17.5em;
  --gap: 0.6em;
  --angle: calc(1turn / var(--n));
  --r: calc((var(--w) + var(--gap)) / 2 / tan(var(--angle) / 2));
  position: relative;
  width: var(--w);
  height: calc(var(--w) * 0.66);
  transform-style: preserve-3d;
  animation: a3d-spin 24s linear infinite;
}
@keyframes a3d-spin { to { transform: rotateY(-1turn); } }

.a3d .card {
  position: absolute;
  inset: 0;
  transform: rotateY(calc(var(--i) * var(--angle))) translateZ(var(--r));
  border-radius: 1.5em;
  overflow: hidden;
  backface-visibility: hidden;
}
```

## A07 高光溢出

`.sk` 要 `overflow: hidden`。图片占位单独 `border-radius: 0`。

```css
.sk { background: #e2e8f0; position: relative; overflow: hidden; border-radius: 6px; }
.sk::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
  transform: translateX(-100%);
  animation: sk-shimmer 1.4s linear infinite;
}
@keyframes sk-shimmer { to { transform: translateX(100%); } }
.sk--image { height: 150px; border-radius: 0; }
.sk--chip { width: 84px; height: 18px; border-radius: 9999px; }
.sk--line { height: 12px; margin: 8px 0; }
.sk--line-lg { height: 20px; margin: 10px 0; }
.sk--w70 { width: 70%; }
.sk--w40 { width: 40%; }
```

## A23 旁边的卡片不变糊

过渡写在静止状态上。

```css
.card { transition: transform .45s, filter .45s, background-position .6s; }
.container:has(.card:hover) .card:not(:hover) { filter: blur(4px); transform: scale(.92); }
.card:hover { background-position: 100% 0; }
.card .card-content { opacity: 0; transform: translateY(24px); transition: opacity .45s, transform .45s; }
.card:hover .card-content { opacity: 1; transform: translateY(0); }
```

## A25 按钮

全部写在一个 `index.html` 里。垂直居中用 `min-height: 100vh`。

```css
body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0f0f0; }
button {
  font-size: 25px; font-weight: bold; padding: 25px 50px; color: #725ac1;
  background: transparent; border: 2px solid #725ac1; border-radius: 15px;
  cursor: pointer; transition: .3s;
}
button:hover { box-shadow: inset 0 -100px 0 0 #725ac1; color: #fff; }
button:active { transform: scale(.9); }
```

## B08 收藏存错了

用 `sessionStorage`。不要再次声明标记上面的 `playlist`、`favCount`、`STORAGE_KEY`。

```js
const favs = () => [...playlist.querySelectorAll('.track--fav')];
playlist.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav');
  if (!btn) return;
  btn.closest('.track').classList.toggle('track--fav');
  const ids = favs().map((li) => li.dataset.id);
  favCount.textContent = ids.length;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
});
const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
playlist.querySelectorAll('.track').forEach((li) => {
  if (saved.includes(li.dataset.id)) li.classList.add('track--fav');
});
favCount.textContent = favs().length;
```

## B19 拼块图是反的

`background-position` 两个值都是负的。`targetX` 从 100 到 540。显示成功文字的元素不要命名为 `status`：`window.status` 是浏览器内建属性，赋值会静默失败。用 `const statusEl = document.getElementById('status')`。stub 里已经有的 `const` 不要再声明一次。

```js
piece.style.backgroundPosition = `-${targetX}px -${HOLE_Y}px`;
targetX = Math.floor(100 + Math.random() * (540 - 100 + 1));
handle.setPointerCapture(e.pointerId);
```

松手时 `|pieceX - targetX| <= 5` 才吸过去，然后 1.5 秒换题。超出就停在原地。

## B30 字重一档一档跳

专家短版只看水平距离，用描边，不依赖可变字体。坐标必须用 `clientX` 和 `getBoundingClientRect()`。讲解在 [鼠标和元素位置](/api/position)。

```js
const h = document.querySelector('h1')
h.innerHTML = [...h.textContent].map((c) => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')
onmousemove = (e) => [...h.children].forEach((x) => {
  const r = x.getBoundingClientRect()
  const w = Math.max(0, 1 - Math.abs(e.clientX - r.left) / 100)
  x.style.webkitTextStroke = `${w * 6}px black`
})
```

## B40 往回滚就断

```js
const y = ((i * SPACING - offset) % TOTAL + TOTAL) % TOTAL - TOTAL / 2;
let offset = TOTAL / 2;
addEventListener('wheel', (e) => { e.preventDefault(); offset -= e.deltaY; render(); }, { passive: false });
```

`translate(-50%, -50%)` 放在 `transform` 最前面。`perspective` 写在容器上。

## C06 500 和月份

月份过滤在场次上。500 整的要排除。并列时片名升序。

```sql
SELECT m.movie_title,
       ROUND(SUM(b.seats * b.price_per_seat), 2) AS total_revenue
FROM bookings b
JOIN screenings s ON s.screening_id = b.screening_id
JOIN movies m ON m.movie_id = s.movie_id
WHERE b.status = 'completed'
  AND s.screening_date >= '2026-03-01'
  AND s.screening_date < '2026-04-01'
GROUP BY m.movie_id, m.movie_title
HAVING ROUND(SUM(b.seats * b.price_per_seat), 2) > 500
ORDER BY total_revenue DESC, m.movie_title ASC;
```

「只算 completed」不是「排除 cancelled」。枚举里如果还有第三种状态，`<> 'cancelled'` 会把那种单也加进去。先看 schema 再用 `status = 'completed'`、`is_cancelled = 0` 或 `cancelled_at IS NULL`。列名以 media 为准。

## C08 total 是 27

`total` 是过滤之后的数量。没有结果时 `total_pages` 仍是 1。超出页码返回 200 和空数组。

```js
const q = (url.searchParams.get('search') || '').trim().toLowerCase();
const filtered = q
  ? jobs.filter((job) => job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q))
  : jobs;
let page = parseInt(url.searchParams.get('page'), 10);
if (!Number.isFinite(page) || page < 1) page = 1;
const total = filtered.length;
const total_pages = Math.max(1, Math.ceil(total / 10));
const data = filtered.slice((page - 1) * 10, page * 10);
```

不要 `require('express')`。

## C09 错误信息串了

顺序不能换。首尾相接不算冲突。

```js
const room = rooms.find((item) => String(item.id) === String(body.room_id));
if (!room) return send(res, 404, { error: 'Room not found' });
if (!(body.attendees >= 1 && body.attendees <= room.capacity))
  return send(res, 422, { error: 'Room capacity exceeded' });
if (!(body.start >= '08:00' && body.start <= '20:00' && body.end >= '08:00' && body.end <= '20:00'))
  return send(res, 422, { error: 'Outside opening hours' });
if (!(body.end > body.start))
  return send(res, 422, { error: 'Invalid time range' });
const clash = bookings.find((item) =>
  String(item.room_id) === String(body.room_id) &&
  item.date === body.date &&
  body.start < item.end && item.start < body.end);
if (clash) return send(res, 409, { error: `Time slot conflicts with booking ${clash.id}` });
const id = Math.max(0, ...bookings.map((item) => Number(item.id))) + 1;
bookings.push(booking);
```

`21:00` 到 `19:00` 两个端点不都在 08:00–20:00 里，要先返回 Outside opening hours，不能漏到 Invalid time range。成功后必须 `push`，否则同一时段再订一次还会 201。错误字段名跟 starter 的 404 保持一致。

## Starter02 时间不在源代码里

时间必须由服务端写进 HTML。查看源代码能看到字符串，刷新会变。不要用浏览器的 `new Date()`。

## 下载文件名不是 14 位

用本地时间。`toISOString()` 是 UTC，月份要 `getMonth() + 1`。

```js
function stamp14() {
  const date = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}
```

文件名：`worldskills-shanghai-2026-${stamp14()}.png`
