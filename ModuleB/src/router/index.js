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
