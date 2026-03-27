import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/register' },
  { path: '/register',         name: 'register',         component: () => import('@/views/ActivityForm/index.vue') },
  { path: '/my-records',       name: 'my-records',       component: () => import('@/views/MyRecords/index.vue') },
  { path: '/pending-approval', name: 'pending-approval', component: () => import('@/views/PendingApproval/index.vue') },
  { path: '/query-stats',      name: 'query-stats',      component: () => import('@/views/QueryStats/index.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
