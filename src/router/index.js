/**
 * Vue Router 配置
 * 管理應用程式的所有路由
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

/**
 * 路由配置
 * 使用懶加載（Lazy Loading）優化首屏加載速度
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首頁',
      requiresAuth: false,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登入',
      requiresAuth: false,
      hideForAuth: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: '註冊',
      requiresAuth: false,
      hideForAuth: true,
    },
  },
  // 文章相關路由
  {
    path: '/posts',
    name: 'AllPosts',
    component: () => import('@/views/posts/AllPostsView.vue'),
    meta: {
      title: '所有文章',
      requiresAuth: false,
    },
  },
  {
    path: '/posts/my',
    name: 'MyPosts',
    component: () => import('@/views/posts/MyPostsView.vue'),
    meta: {
      title: '我的文章',
      requiresAuth: true,
    },
  },
  {
    path: '/posts/create',
    name: 'PostCreate',
    component: () => import('@/views/posts/PostFormView.vue'),
    meta: {
      title: '新增文章',
      requiresAuth: true,
    },
  },
  {
    path: '/posts/:id/edit',
    name: 'PostEdit',
    component: () => import('@/views/posts/PostFormView.vue'),
    meta: {
      title: '編輯文章',
      requiresAuth: true,
    },
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('@/views/posts/PostDetailView.vue'),
    meta: {
      title: '文章詳情',
      requiresAuth: false,
    },
  },
  // 商品管理路由（僅限管理者）
  {
    path: '/items',
    name: 'Items',
    component: () => import('@/views/items/ItemsView.vue'),
    meta: {
      title: '商品管理',
      requiresAuth: true,
      requiresAdmin: true, // 只有管理者可以訪問
    },
  },
  // 短網址路由
  {
    path: '/short-urls',
    name: 'ShortUrls',
    component: () => import('@/views/shortUrls/ShortUrlsView.vue'),
    meta: {
      title: '短網址',
      requiresAuth: true,
    },
  },
  // 404 頁面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '頁面不存在',
    },
  },
]

/**
 * 創建路由實例
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 路由切換時滾動到頁面頂部
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

/**
 * 全域前置守衛
 * 在進入路由前檢查認證狀態
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const hideForAuth = to.meta.hideForAuth
  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin

  // 設置頁面標題
  document.title = to.meta.title
    ? `${to.meta.title} - Vue3 Laravel Demo`
    : 'Vue3 Laravel Demo'

  // 需要登入但未登入，跳轉到登入頁
  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }, // 記錄原本要去的頁面
    })
  }
  // 管理者訪問非管理頁面，重定向到商品管理
  else if (isAdmin && isAuthenticated && !requiresAdmin && to.name !== 'Login' && to.name !== 'Register') {
    console.warn('⚠️ 管理者只能訪問商品管理頁面')
    next({ name: 'Items' })
  }
  // 需要管理者權限但不是管理者，跳轉到我的文章
  else if (requiresAdmin && !isAdmin) {
    console.warn('⚠️ 無權限訪問此頁面')
    next({ name: 'MyPosts' })
  }
  // 已登入但訪問登入/註冊頁
  else if (hideForAuth && isAuthenticated) {
    // 管理者導向商品管理，一般用戶導向我的文章
    next({ name: isAdmin ? 'Items' : 'MyPosts' })
  }
  // 允許訪問
  else {
    next()
  }
})

/**
 * 全域後置守衛
 * 可以在這裡做一些頁面載入完成後的處理
 */
router.afterEach((to, from) => {
  // 例如：關閉 loading、發送頁面瀏覽統計等
  console.log(`📍 路由切換: ${from.name || 'unknown'} → ${to.name}`)
})

export default router
