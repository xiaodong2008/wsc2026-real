# Web Share

只在用户点按钮时调用。先做成 `File`，再问浏览器能不能分享这种文件。取消分享不要当成失败去下载。

## File 不是图片地址

`navigator.share` 的 `files` 要 `File` 对象。blob URL 字符串不行。

```js
const blob = await toBlob()
const file = new File([blob], fileName(), { type: 'image/png' })
```

`File` 是带文件名的 `Blob`。第一个参数是数组，里面放 blob。`type` 要和 PNG 一致。

文件名是题目规定的：

```js
function stamp14() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}
const fileName = () => `worldskills-shanghai-2026-${stamp14()}.png`
```

`getMonth()` 从 0 开始，必须加 1。`toISOString()` 是 UTC，不是本地时间，不要用。14 位是 `YYYYMMDDHHMMSS`，例如 `20260923143005`。

## 能不能分享

桌面 Chrome 往往有 `navigator.share`，但不接受文件。只判断函数在不在，会进到 `share()` 然后抛错。

```js
if (navigator.canShare?.({ files: [file] })) {
  // 这个浏览器接受「带这一份文件」的分享
} else {
  await downloadBlob(blob)
}
```

`?.` 是：没有 `canShare` 就当 false，不抛错。参数必须把要分享的 `file` 传进去，空着调用只说明「能不能分享文字」。

## 分享本身

必须放在点击处理函数里。浏览器只在用户手势后的一小段时间允许弹分享面板。

```js
await navigator.share({
  title: 'WorldSkills Shanghai 2026',
  text: 'My conference photo souvenir!',
  files: [file],
})
```

题目要求这三样都有：标题、一段文字、图片文件。

Vue 里按钮写成 `@click="onShare"`。如果写成 `@click="downloadBlob"`，Vue 会把鼠标事件当成第一个参数传进去。

## 取消分享

用户关掉分享面板，Promise 会 reject，`err.name === 'AbortError'`。没有可分享的目标时，有的浏览器也用这个名字。

这时不要再自动下载。下载按钮还在，用户可以自己点。其它错误（例如手势过期的 `NotAllowedError`）再落到下载。

```js
async function onShare() {
  const blob = await toBlob()
  if (!blob) return
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

`await toBlob()` 如果很慢，点按钮时的用户手势会过期，`share` 抛 `NotAllowedError`。上面的 `catch` 会改成下载，控制台不应再出现未捕获的红字。

## 下载

```js
async function downloadBlob(blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName()
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
```

`download` 属性是保存时的文件名。`click()` 之后浏览器还要读这个地址，立刻 `revokeObjectURL` 会把下载截断，所以晚一秒再释放。

不支持分享时走这个函数，不要 `throw`。
