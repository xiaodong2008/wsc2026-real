# Photo

对应 `ModuleB/src/views/PhotoView.vue` 和 `src/lib/frames.js`。这一块不依赖 JSON，数据卡住时可以先做它。

API 本身分开写了，Photo 页只保留比赛规则。画布见 [Canvas](/api/canvas)，分享和下载见 [Web Share](/api/webshare)。

## 这份练习包里的文件

| 设计 | Normal 1080×1080 | Wide 1600×1080 |
| --- | --- | --- |
| bands polaroid diagonal neon | 有 | 有 |
| panels | 没有 | `frame_wide_panels.png` |
| geometric | `frame_geometric.png` | 没有 |

正式比赛以 `ls public/frames` 为准，不要背这张表。没有的比例按钮加 `disabled`，而且当前比例不可用时自动切到有的那个。

## 切了比例画布却是空的

必须等 `decode()` 结束再改 `canvas.width`。连点两张图时用序号丢掉过期的那次。

```js
let frameSeq = 0
async function loadFrame() {
  const src = ratio.value === 'wide' ? design.value.wide : design.value.normal
  if (!src) return
  const mine = ++frameSeq
  const img = new Image()
  img.src = src
  await img.decode()
  if (mine !== frameSeq) return
  frameImg = img
  redraw()
}
```

## 铺不满或变形

cover 是 `Math.max`。`Math.min` 会留白。内部像素用 frame 的 `naturalWidth/Height`，CSS 只写 `max-width: 100%; height: auto`。

```js
function drawCover(ctx, img, width, height) {
  const scale = Math.max(width / img.width, height / img.height)
  const w = img.width * scale
  const h = img.height * scale
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
}
function redraw() {
  const width = frameImg.naturalWidth
  const height = frameImg.naturalHeight
  canvas.value.width = width
  canvas.value.height = height
  const ctx = canvas.value.getContext('2d')
  if (userImg) drawCover(ctx, userImg, width, height)
  ctx.drawImage(frameImg, 0, 0, width, height)
}
```

改 `canvas.width` 会清空画布，所以每次都要完整重画。选过一张图后再选同一张，要先把 `input.value` 清空。

## 分享和下载

模板里用 `@click="onDownload"`，不要写成 `@click="downloadBlob"`，否则第一个参数会变成鼠标事件。

文件名是 `worldskills-shanghai-2026-` 加 14 位本地时间。见 [考场粘贴](/paste#下载文件名不是-14-位)。

```js
async function onShare() {
  const blob = await toBlob()
  const file = new File([blob], fileName(), { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: 'WorldSkills Shanghai 2026',
        text: 'My conference photo souvenir!',
        files: [file],
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        hint.value = 'Sharing was not completed. Use Download to save the image.'
        return
      }
      await downloadBlob(blob)
    }
  } else {
    await downloadBlob(blob)
  }
}
```

## 一点分享就下载

`AbortError` 要单独 return。把它当成失败再下载，取消分享也会存文件。

不支持分享时自动下载，控制台不能有红字。`revokeObjectURL` 不要在 `click()` 的同一行立刻调用，等一秒。
