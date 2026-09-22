# 鼠标和元素位置

三套坐标不能混。B30、B19、B40 全是这一页。

## 三套数字

| 名字 | 原点 | 什么时候用 |
| --- | --- | --- |
| `clientX` / `clientY` | 浏览器窗口里页面可见区域的左上角 | 和 `getBoundingClientRect()` 是同一套，鼠标跟元素比距离只用这对 |
| `pageX` / `pageY` | 整份文档的左上角，包含已经滚走的部分 | 页面真的在滚动时才用。和 rect 相减之前，rect 也得加上滚动 |
| `screenX` / `screenY` | 显示器左上角，含浏览器标题栏 | 不要拿来和元素比。差的是窗口在屏幕上的位置 |

`offsetLeft` / `offsetTop` 也不是视口坐标。它们相对 `offsetParent`（通常是某个定位过的祖先，没有的话是 body）。和 `clientX` 相减没有意义。

练习里如果写成 `e.screenX` 配 `el.offsetLeft`，鼠标在字上面时距离仍然很大，字不会变粗。

## getBoundingClientRect

```js
const r = el.getBoundingClientRect()
```

返回的都是相对视口的像素：

- `r.left` `r.top`：元素左上角
- `r.right` `r.bottom`：元素右下角
- `r.width` `r.height`：宽高
- 中心：`r.left + r.width / 2`，`r.top + r.height / 2`

元素一移动（滚动、改字号、窗口缩放），旧的 rect 就过期。字不多时，每次 `mousemove` 重新量一次最省事。

## 距离怎么变成粗细

水平距离：

```js
const dx = Math.abs(e.clientX - (r.left + r.width / 2))
```

平面距离（鼠标在字的上方也会变粗）：

```js
const d = Math.hypot(
  e.clientX - (r.left + r.width / 2),
  e.clientY - (r.top + r.height / 2)
)
```

`Math.hypot(dx, dy)` 就是 `Math.sqrt(dx * dx + dy * dy)`。

近处是 1、远处是 0：

```js
const t = Math.max(0, 1 - d / 100)
```

`100` 是影响半径，单位像素。鼠标离字母中心 0px 时 `t` 是 1；超过 100px 时 `t` 被 `Math.max` 按在 0。把 100 改大，变粗的范围更宽。

## B30 专家短版

题目要每个字母按自己到鼠标的距离连续变粗，不能一档一档跳。静态字体的 `font-weight: 437` 会吸到 400 或 500。`-webkit-text-stroke` 是连续的像素，任何字体都能用。

专家版本只看水平方向，距离用字母左边缘，描边最大 6px。文字先写在 `<h1>` 里再拆，空格换成 `&nbsp;`，否则两个词会粘住。`body` 还要有高度，`place-items: center` 才在视口正中。

```html
<body style="display:grid;place-items:center;min-height:100vh">
<h1 style="font-size:4em">WorldSkills Shanghai</h1>
<script>
const h = document.querySelector('h1')
h.innerHTML = [...h.textContent].map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')
onmousemove = e => [...h.children].forEach(x => {
  const r = x.getBoundingClientRect()
  const w = Math.max(0, 1 - Math.abs(e.clientX - r.left) / 100)
  x.style.webkitTextStroke = `${w * 6}px black`
})
</script>
</body>
```

逐行：

1. `[...h.textContent]` 把字符串拆成字符数组，空格也算一个字符。
2. 每个字符包进 `<span>`，后面才能单独设描边。
3. `onmousemove` 是 `window` 上的鼠标移动。光标在页面任何地方都要算。
4. `r.left` 是这个字母左边缘的视口 x。`e.clientX - r.left` 是鼠标到这条边的水平距离，可正可负，所以取绝对值。
5. 除以 100 再被 1 减，得到 1 到 0。乘 6 就是 6px 到 0px 的描边。
6. 想让上下也影响粗细，把第 4 行换成中心点的 `Math.hypot`。参考视频如果鼠标在文字上方字也会变粗，就用平面距离。

## B19 拖拽：指针位移映射到拼块

滑块轨道和拼块的可移动范围不一样。不能把 `clientX` 直接当成拼块的 `left`。

按下时记下两件套：

```js
startPointer = e.clientX
startHandle = parseFloat(handle.style.left) || 0
handle.setPointerCapture(e.pointerId)
```

`setPointerCapture` 之后，指针移出滑块，`pointermove` 仍会送到这个元素上。

移动时只加差值：

```js
const next = startHandle + (e.clientX - startPointer)
```

`e.clientX - startPointer` 是从按下那一点开始挪了多少像素，和元素原来在哪无关。

滑块走满 `handleMax` 像素时，拼块要走满 `540`（600 减 60）：

```js
pieceX = Math.round(hx * 540 / handleMax)
```

`hx / handleMax` 是 0 到 1 的比例，乘 540 就映射到拼块。

拼块显示的图块是另一套位置。`background-position: -targetX -HOLE_Y` 表示把原图往左上挪，让 `(targetX, HOLE_Y)` 那一块落在拼块的左上角。正值会露错地方。

## B40 滚轮

`wheel` 事件的 `deltaY` 向下滚是正的，向上是负的。位置累加它，方向就自动反了。

```js
addEventListener('wheel', (e) => {
  e.preventDefault()
  offset += e.deltaY
  render()
}, { passive: false })
```

`{ passive: false }` 才能 `preventDefault()`。否则浏览器当这个监听不会取消滚动，页面自己也会滚。

一条文字的 y 要在总长度里回绕。JavaScript 的 `%` 对负数仍是负数，往回滚会跳。改成正余数：

```js
const y = ((raw % TOTAL) + TOTAL) % TOTAL - TOTAL / 2
```

减 `TOTAL / 2` 是为了让 0 落在屏幕中心，而不是顶边。
