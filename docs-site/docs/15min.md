# 15 分钟只做这些

两次上网不能连着用，只能浏览，不能登录。这一页是进浏览器之前的清单。

## 不要搜的

Tailwind 的安装也不要搜。建仓时选 Vue 的 `tailwind-config` 分支就有了。类名不生效时，先看是不是写了不带 `@layer` 的 CSS。

下面这些站里已经有可粘贴的整段，搜 MDN 会把 15 分钟花掉：

- hash 路由、`fetch` 相对路径、`localStorage`
- CSS `tan()`、`preserve-3d`、shimmer
- 分页 `total` / `total_pages`
- 会议室重叠用严格小于
- canvas 的 `drawImage`、`naturalWidth`、cover 用 `Math.max`。见 [Canvas](/api/canvas)
- `clientX` 和 `getBoundingClientRect`。见 [鼠标和元素位置](/api/position)
- `perspective`、`preserve-3d`、`tan()` 半径。见 [CSS 3D](/api/css3d)
- 下载文件名用本地时间，不用 `toISOString()`。见 [Web Share](/api/webshare)

## 值得打开的一页

只在 Photo Booth 的分享还没亲手跑通过时打开：

[MDN: Navigator.canShare()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare)

看三件事，看完就关：

1. `canShare({ files: [file] })` 在桌面 Chrome 上是 true 还是 false
2. 用户取消分享时抛的是不是 `AbortError`
3. 文件必须是 `File`，不能是 blob URL

对照抄 [Photo 页的分享函数](/b/photo#分享和下载)。取消分享只提示，不要再触发下载。

## 如果这页打不开

搜索词只打这一句：

```text
mdn navigator.canShare files
```

打开第一条官方文档。不要点博客。

## 还剩时间才做的

按这个顺序，做完一条就停：

1. 对照 [18 个 testid](/b/shell#18-个-testid) 看自己有没有写错字
2. 对照 [地图两套网格](/b/map#两套网格) 看 375 和 768
3. 对照 [C09 顺序](/paste#c09-错误信息串了) 看校验是不是 1 到 6

时间到了就回到编辑器。不要新开第三个标签。
