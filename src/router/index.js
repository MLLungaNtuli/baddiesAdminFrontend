import { createRouter, createWebHistory } from 'vue-router'

import AdminLogin from '../views/AdminLogin.vue'
import Dashboard from '../views/Dashboard.vue'
import Escorts from '../views/Escorts.vue'
import ImageApproval from '../views/ImageApproval.vue'
import Bookings from '../views/Bookings.vue'
import ActivityLogs from '../views/ActivityLogs.vue'
import { auth } from '@/services/auth'

// Helper function to check permissions
const hasPermission = (requiredPermission) => {
  const user = auth.user
  if (!user) return false
  
  // Super admin has all permissions
  if (user.role === 'super_admin') return true
  
  // Check if user has the required permission
  return user.permissions?.includes(requiredPermission) || false
}

const routes = [
  { path: '/login', component: AdminLogin },
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/escorts', component: Escorts, meta: { requiresAuth: true } },
  { 
    path: '/escort/:id',
    name: 'escort-profile',
    component: () => import('../views/EscortProfile.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/images', component: ImageApproval, meta: { requiresAuth: true } },
  { path: '/bookings', component: Bookings, meta: { requiresAuth: true } },
  { path: '/logs', component: ActivityLogs, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  if (to.path === '/login' && token) {
    next('/')
    return
  }

  next()
})


export default router