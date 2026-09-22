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

目标：照片铺满画布，不拉伸，多出来的部分裁掉，不留白边。

```js
function drawCover(ctx, img, width, height) {
  const scale = Math.max(width / img.width, height / img.height)
  const w = img.width * scale
  const h = img.height * scale
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
}
```

`width / img.width` 是「为了让照片宽度刚好等于画布，要放大多少」。高同理。`Math.max` 取更大的那个倍率，短边也会超出画布，超出的部分自然被裁掉。`(width - w) / 2` 是负数或零，把多出来的一半放到画布左边外面，看起来就是居中。

数字例子：2000×1000 的横图放进 1080×1080。

- 宽的倍率 `1080 / 2000 = 0.54`
- 高的倍率 `1080 / 1000 = 1.08`
- `Math.max` 得 1.08，画上去是 2160×1080，x 是 `(1080 - 2160) / 2 = -540`
- 上下刚好贴齐，左右被裁掉，没有白边

`Math.min` 得 0.54，画上去是 1080×540，上下各空 270px。那是 contain，题目不要。

竖图反过来：宽的倍率更大，左右贴齐，上下被裁。

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
