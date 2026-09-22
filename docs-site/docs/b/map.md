# Map

对应 `ModuleB/src/views/MapView.vue`。网格和颜色写在 `src/style.css` 的 `@layer components`，不要写进组件的无层叠 `<style>`，否则会盖过 Tailwind 类。颜色和网格按题目，不要凭记忆改 hex。

## 两套网格

375 宽是两列，走廊不出现。768 宽起三列，中间列更宽，走廊出现。

```css
.map {
  display: grid; gap: 8px; grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "room1 room1" "room2 room2" "room3 room3"
    "public road" "entr shop" "entr rest" "hall room4";
}
.zone.corr-h, .zone.corr-v { display: none; }
@media (min-width: 768px) {
  .map {
    grid-template-columns: 1fr 1.5fr 1fr;
    grid-template-areas:
      "room1 room2 room3"
      "corrh corrh road"
      "public corrv road"
      "public entr shop"
      "hall entr rest"
      "hall room4 room4";
  }
  .zone.corr-h, .zone.corr-v { display: grid; }
}
```

## 移动端走廊还在

选择器必须是 `.zone.corr-h`。只写 `.corr-h` 会被后面的 `.zone { display: grid }` 盖掉。不要用 `visibility: hidden`，那还会占格子。

## 颜色

题目给的是 hex，原样写进 `--c`。hex 不能写 `#3D7AE8 / 13%`。要淡化时用 `rgb(from var(--c) r g b / 13%)`：保持原来的红绿蓝，只把透明度换成 13%。字和色点直接用 `var(--c)`。

```css
.zone {
  background: rgb(from var(--c) r g b / 13%);
  border: 1px solid rgb(from var(--c) r g b / 45%);
  color: var(--c);
}
.z-room1 { --c: #3D7AE8; }
.z-room2 { --c: #1FA887; }
.z-room3 { --c: #7C5EC7; }
.z-room4 { --c: #D45F84; }
.z-hall  { --c: #C48A2A; }
.z-road  { --c: #2A9BB8; }
.z-public { --c: #6D84A8; }
.z-entr, .z-shop, .z-rest, .corr-h, .corr-v { --c: #8A99B0; }
```

可点的只有 Room 1–4 和 Hall。点了读 `api/rooms/room1/sessions.json` 这种路径，`room` 的值就是 `room1` … `hall`。

## 减少动态效果无效

面板常驻 DOM，用 class 开关，不要 `v-if`。媒体查询里必须连 `.open` 一起写，否则打开时仍会滑 300ms。

```css
.sheet { transform: translateY(100%); visibility: hidden; transition: transform .3s ease, visibility 0s .3s; }
.sheet.open { transform: translateY(0); visibility: visible; transition: transform .3s ease; }
@media (prefers-reduced-motion: reduce) {
  .sheet, .sheet.open, .backdrop, .backdrop.open { transition: none; }
}
```

Done 和点空白都能关。JSON 失败时文案放进全局 `error-message`。
