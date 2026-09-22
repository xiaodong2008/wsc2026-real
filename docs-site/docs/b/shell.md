# 外壳和 testid

建仓选 Vue，分支用 `tailwind-config`，不要用默认的 main。那条分支已经装好 Tailwind 4.1.18，`src/style.css` 里有 `@import "tailwindcss"`，`vite.config.js` 注册了 `@tailwindcss/vite`。

成品在 `ModuleB/`。前 15 分钟只做这件事：资源进 `public/`，四个空视图加上面的 testid，hash 路由能深链。

## 工具类不生效

模板自己的 CSS 放在 `@layer base` 里。你如果在组件 `<style>` 里写不带 layer 的 `button { background }`，它会压过 `bg-blue-600`，类名看起来像没写上。自定义规则放进 `src/style.css` 的 `@layer components`。地图网格就放那里，其余间距、颜色、圆角直接用类。

## 18 个 testid

全局只放一个 `error-message`，放在 `App.vue`，不要每个视图各放一个。

| testid | 放在 |
| --- | --- |
| `nav-schedule` `nav-map` `nav-stamps` `nav-photo` | 底部四个链接 |
| `schedule-list` | 会议列表容器 |
| `error-message` | 全局唯一 |
| `zone-room1` `zone-room2` `zone-room3` `zone-room4` `zone-hall` | 地图上可点的五块。是 `zone-room1`，不是 `zone-room-1` |
| `room-modal` | 上滑面板，关着也留在 DOM 里 |
| `modal-close-btn` | Done 按钮，带 `-btn` |
| `photo-upload` | `<input type="file" accept="image/*">` |
| `download-btn` `share-btn` | 两个按钮 |
| `ratio-normal` `ratio-wide` | 比例按钮 |

贴进控制台。不在当前视图里的可以是 0，出现了就必须是 1，不能是 2。

```js
['nav-schedule','nav-map','nav-stamps','nav-photo','schedule-list','error-message',
 'zone-room1','zone-room2','zone-room3','zone-room4','zone-hall',
 'room-modal','modal-close-btn','photo-upload','download-btn','share-btn',
 'ratio-normal','ratio-wide']
 .forEach(t => { const n = document.querySelectorAll(`[data-testid="${t}"]`).length
                 if (n !== 1) console.warn(t, n) })
```

## hash 路由

不要改成 history。模板默认是 `createWebHistory`，要换成下面这段。

```js
import { createRouter, createWebHashHistory } from 'vue-router'
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/schedule' },
    { path: '/schedule', component: () => import('../views/ScheduleView.vue') },
    { path: '/map', component: () => import('../views/MapView.vue') },
    { path: '/stamps', component: () => import('../views/StampsView.vue') },
    { path: '/photo', component: () => import('../views/PhotoView.vue') },
  ],
})
```

底部用 `<RouterLink to="/map" data-testid="nav-map">`。高亮用自带的 `.router-link-active`。

## 资源放哪

拷进 `public/`，不是 `src/assets/`。请求不要加前导斜杠：

```js
fetch('api/schedule.json')
```

`expert_readme.txt` 写清怎么跑、线上地址在哪。漏了这个文件是白丢的分。

## 深链

地址栏直接打开 `#/photo` 必须是 Photo，而且 Network 里没有新的 document 请求。
