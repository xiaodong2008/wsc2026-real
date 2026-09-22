import { defineConfig } from 'vitepress'

const a = [
  { text: '考场粘贴', link: '/paste' },
  { text: '15 分钟上网', link: '/15min' },
]
const moduleA = [
  { text: 'A 组速查', link: '/a' },
]
const moduleB = [
  { text: '外壳 / testid', link: '/b/shell' },
  { text: 'Schedule', link: '/b/schedule' },
  { text: 'Map', link: '/b/map' },
  { text: 'Stamps', link: '/b/stamps' },
  { text: 'Photo', link: '/b/photo' },
]
const api = [
  { text: '鼠标和元素位置', link: '/api/position' },
  { text: 'Canvas', link: '/api/canvas' },
  { text: 'Web Share', link: '/api/webshare' },
  { text: 'CSS 3D', link: '/api/css3d' },
]

export default defineConfig({
  title: 'WSC 速查',
  description: '15 分钟内按症状找到可粘贴的代码',
  lang: 'zh-CN',
  base: process.env.DOCS_BASE || '/',
  cleanUrls: true,
  themeConfig: {
    search: { provider: 'local' },
    outline: { label: '本页', level: [2, 3] },
    nav: [
      { text: '粘贴', link: '/paste' },
      { text: '15 分钟', link: '/15min' },
      { text: 'Module A', link: '/a' },
      { text: 'Module B', link: '/b/shell' },
    ],
    sidebar: [
      { text: '先打开', items: a },
      { text: 'Module A', items: moduleA },
      { text: 'Module B', items: moduleB },
      { text: '不常用 API', items: api },
    ],
  },
})
