import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    // Lazy-loaded: this route's chunk is only fetched when it is visited.
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  ],
})
