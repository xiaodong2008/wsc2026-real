# Stamps

对应 `ModuleB/src/views/StampsView.vue`。

## 规则

- 16 格。1–4 是 Day 1，5–8 Day 2，9–12 Day 3，13–16 Day 4。图是 `stamps/1.png` 到 `stamps/16.png`。
- 文案是 `3 out of 16`，进度用原生 `<progress max="16">`。
- 手机 2 列，768px 起 4 列。
- 未收集的图 `opacity: .35`。
- 正确码收进 `localStorage` 键 `wsc2026-stamps`。刷新还在。
- 错码：`Incorrect attendance code. Please try again.`
- 重复码：`You already collected this stamp.` 计数不变。用 `Set`，先查再加。

## 表单不粘住

表单是 `position: sticky; top: 0`，放在会滚动的 `main` 里面。从 `App.vue` 到这个表单的祖先不要写 `overflow: hidden`。进度条不要 sticky。

## 收集动画

缩放回弹要留。彩带时间不够可以不画，那是最低的一截分。

```css
@keyframes stamp-pop {
  0% { transform: scale(2.2); opacity: 0; }
  60% { transform: scale(.92); opacity: 1; }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .stamp.just img { animation: none; }
}
```

码的算法和 Schedule 详情用同一个 `codeOf`。两边不一致就永远收不进去。
