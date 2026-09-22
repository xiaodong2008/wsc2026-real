# Canvas

Photo Booth 只用 2D。背住：位图像素和 CSS 尺寸是两套，`drawImage` 先画用户图再画相框，改 `canvas.width` 会清空。

## 两套尺寸

```js
canvas.width = 1080
canvas.height = 1080
```

这是里面那张位图有多少像素。一赋值，画布内容被清掉，后面必须整张重画。

```css
canvas { max-width: 100%; height: auto; display: block; }
```

这只决定位图在页面上显示多大。用 CSS 把 1080 的画布拉成 1600×900，图会被拉伸。比赛要的是：内部尺寸等于当前 frame PNG 的原始尺寸，CSS 只负责缩进屏幕、不产生横向滚动。

读图的原始尺寸用 `img.naturalWidth` 和 `img.naturalHeight`。还没解码完时它们是 0。

## 拿到画笔

```js
const ctx = canvas.getContext('2d')
```

一页一个 canvas 就够。每次重画重新取一次也行。

## drawImage 的三种写法

```js
ctx.drawImage(img, dx, dy)
ctx.drawImage(img, dx, dy, dw, dh)
ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
```

- 前两个数字是画到画布的位置。
- 再加宽高，是画上去之后的尺寸，不是裁原图。
- 九个参数才是裁剪：从原图 `(sx, sy)` 取出 `sw×sh`，画到画布 `(dx, dy)` 的 `dw×dh`。

相框盖在最上面时用第二种，尺寸等于整张画布：

```js
ctx.drawImage(frameImg, 0, 0, width, height)
```

相框 PNG 中间是透明的，所以用户的照片从透明处露出来。必须先画照片，再画相框。

## cover 铺满

题目要的是：照片铺满整张画布，人物不发胖也不被拉高，多出来的边裁掉，四周不能留白。

宽和高必须乘**同一个**倍数。倍数只有一个，宽高比就还是原图的宽高比，所以不会变形。

考场上按这四步算，不要背中间的数字。

### 1. 两个倍率

画布宽 `W`、高 `H`。照片宽 `img.width`、高 `img.height`。

```js
const scaleX = W / img.width   // 让照片的宽刚好等于画布，要乘多少
const scaleY = H / img.height  // 让照片的高刚好等于画布，要乘多少
```

### 2. 选较大的那个

```js
const scale = Math.max(scaleX, scaleY)
```

只满足较小的那个时，另一边会短一截，画布上就出现白边。取较大的那个，短的那边会超出画布，超出的部分被画布边缘裁掉。这就是 cover。`Math.min` 是 contain，会留白，这题不能用。

### 3. 乘回宽高

```js
const w = img.width * scale
const h = img.height * scale
```

`w / h` 仍然等于 `img.width / img.height`。比例没变。

### 4. 居中，多出来的放到画布外面

```js
const x = (W - w) / 2
const y = (H - h) / 2
ctx.drawImage(img, x, y, w, h)
```

超出的那边，`W - w` 是负数，除以 2 之后起点在画布左边或上边的外面。`drawImage` 允许画出界，出界的像素不显示，看起来就是裁切并且居中。

合在一起：

```js
function drawCover(ctx, img, W, H) {
  const scale = Math.max(W / img.width, H / img.height)
  const w = img.width * scale
  const h = img.height * scale
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
}
```

### 横图：2000×1000 放进 1080×1080

- `scaleX = 1080 / 2000 = 0.54`，按这个乘，高只剩 `1000 × 0.54 = 540`，上下各空 270
- `scaleY = 1080 / 1000 = 1.08`，按这个乘，宽变成 `2000 × 1.08 = 2160`，比画布宽
- 取 `1.08`。画上去是 2160×1080
- `x = (1080 - 2160) / 2 = -540`，左右各裁掉 540
- `y = (1080 - 1080) / 2 = 0`，上下贴齐

没有白边，人也没有被拉高。

### 竖图：1000×2000 放进 1080×1080

- `scaleX = 1080 / 1000 = 1.08`
- `scaleY = 1080 / 2000 = 0.54`
- 取 `1.08`。画上去是 1080×2160
- `x = 0`，左右贴齐
- `y = (1080 - 2160) / 2 = -540`，上下各裁掉 540

正方形的图两个倍率相同，`x` 和 `y` 都是 0，正好铺满，不裁。

画完用户的照片，再 `ctx.drawImage(frameImg, 0, 0, W, H)` 把相框盖上去。相框中间是透明的。

## naturalWidth 还是 0

```js
const img = new Image()
img.src = 'frames/frame_wide_bands.png'
await img.decode()
canvas.width = img.naturalWidth
canvas.height = img.naturalHeight
```

`img.src = ...` 立刻返回，解码在后面。同一轮函数里马上读 `naturalWidth`，经常仍是 0，于是 `canvas.width = 0`，画面是空的。症状就是切了 Wide，画布尺寸却不变。

`decode()` 返回一个 Promise，图片可用之后才继续。老浏览器没有它，就用：

```js
img.onload = () => { /* 这里才能读 naturalWidth */ }
img.src = url
```

`src` 要写在 `onload` 后面，否则缓存图片可能在你赋值 onload 之前就加载完了。

连点两个相框时，先发出去的请求可能后到，把最后一次选择盖掉。用序号丢掉过期的：

```js
let frameSeq = 0
async function loadFrame(src) {
  const mine = ++frameSeq
  const img = new Image()
  img.src = src
  await img.decode()
  if (mine !== frameSeq) return
  frameImg = img
  redraw()
}
```

## 用户选的文件

```js
input.onchange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    userImg = img
    URL.revokeObjectURL(img.src)
    redraw()
  }
  img.src = URL.createObjectURL(file)
  e.target.value = ''
}
```

`createObjectURL` 给这个 `File` 一个临时地址，`<img>` 才能当图片加载。用完 `revokeObjectURL`，否则地址一直占着。

`e.target.value = ''` 是因为选同一张图时，浏览器认为值没变，不会再触发 `change`。

`<input type="file" accept="image/*">` 在手机上同时提供相册和拍照。不要加 `capture`，那会只剩拍照。

## 每次重画的顺序

```js
function redraw() {
  const width = frameImg.naturalWidth
  const height = frameImg.naturalHeight
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  if (userImg) drawCover(ctx, userImg, width, height)
  ctx.drawImage(frameImg, 0, 0, width, height)
}
```

顺序固定：改尺寸（顺便清空）、铺用户图、盖相框。漏了任何一层，切换比例后就会留下上一张的残图，或者只剩空白。

## 导出

```js
canvas.toBlob((blob) => { /* blob 是 PNG 的二进制 */ }, 'image/png')
```

回调是异步的。在它外面立刻用 `blob`，变量还是空的。包成 Promise：

```js
const toBlob = () => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
const blob = await toBlob()
```

`toDataURL()` 给的是很长的 base64 字符串，分享接口要的是文件对象，用 `toBlob`。

下载和分享怎么接这个 blob，写在 [Web Share](/api/webshare)。
