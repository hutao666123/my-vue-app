import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: 'article/:id',
        name: 'ArticleDetail',
        component: () => import('../views/ArticleDetail.vue')
      }
    ]
  },
  {
    path: '/sites',
    name: 'Sites',
    component: () => import('../views/Sites.vue')
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('../views/Documents.vue')
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/Courses.vue')
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../views/Practice.vue')
  },
  {
    path: '/creative',
    name: 'Creative',
    component: () => import('../views/Creative.vue')
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('../views/Map.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 这里可以添加需要登录才能访问的路由判断
  next()
})

export default router 