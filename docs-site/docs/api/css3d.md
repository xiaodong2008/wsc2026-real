# CSS 3D

A12 的圆柱。父元素负责「眼睛离画面多远」，被转的那一层负责「子元素真的待在 3D 里」，每张卡片自己转开再沿 Z 推出去。

## 三层各写什么

```text
body          perspective: 1200px          眼睛到画面的距离。写在「要呈现 3D 的元素」的父级上
.a3d          transform-style: preserve-3d 子元素的 3D 不要被拍扁
              animation: rotateY           整圈自己转
.card         rotateY + translateZ         第 i 张转到自己的角度，再推到圆柱表面
```

`perspective` 写在 `.a3d` 自己身上，近大远小作用在它的子元素上会不稳定。写在 `body` 或包住它的 `.scene` 上。

`perspective: 1200px` 越小，近大远小越夸张。题目没有规定这个数，能看出远近即可。

## 一张卡片的位置

HTML 已经给了 `--n`（一共几张）和 `--i`（这张是第几张，从 0 开始）。不要在 CSS 里写 12 或 `30deg`。

相邻两张的夹角：

```css
--angle: calc(1turn / var(--n));
```

12 张时是 30 度，但这个 30 是算出来的。改成 8 张必须变成 45 度，所以不能写死。

卡片宽 `w`，中间留一点缝 `gap`。要让它们边靠边围成正多边形，推出去的半径是：

```css
--r: calc((var(--w) + var(--gap)) / 2 / tan(var(--angle) / 2));
```

`tan()` 要吃一个角度。`1turn / var(--n)` 是角度，合法。`tan()` 返回的是没有单位的数，长度除以它仍然是长度。

卡片自己的变换：

```css
transform: rotateY(calc(var(--i) * var(--angle))) translateZ(var(--r));
```

先在原处绕 Y 轴转到自己的方向，再沿着自己的前方推 `r`。顺序写反，卡片会堆在圆心。

12 张、宽 `17.5em`、缝 `0.6em`、根字号 16px 时，半径大约是 540px。把 `--n` 改成 8，半径大约变成 350px。如果还是 540，说明半径写死了。

## 什么会把 3D 拍扁

下面任何一条出现在 `.a3d` 上，`preserve-3d` 失效，圆柱变成一叠平面卡片：

- `overflow` 不是 `visible`（最常见的是 `overflow: hidden`）
- `opacity` 小于 1
- `filter`，包括 `blur`
- `transform-style` 没写，默认就是 `flat`

藏滚动条写在 `html, body` 上，不要写在 `.a3d` 上。圆角裁图片写在 `.card` 上，那只拍扁这一张卡片内部，圆柱还在。

背面会透出来时，给卡片加：

```css
backface-visibility: hidden;
```

## 转动

```css
.a3d { animation: a3d-spin 24s linear infinite; }
@keyframes a3d-spin { to { transform: rotateY(-1turn); } }
```

必须 `linear`。用 ease 会一快一慢，转完一圈时速度对不上，能看出重置。

转到整一圈（`1turn`）再循环。转到 `359deg` 再跳回 0，接缝会闪。

## 整段可粘贴

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
.a3d .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
```

`.a3d` 必须有明确宽高，因为卡片是 `position: absolute; inset: 0`，父级没有尺寸时卡片面积是 0。
