/**
 * 應用程式入口文件
 * 初始化 Vue 應用、Router、Pinia 等核心功能
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/auth.store'
import './style.css'

// 創建 Vue 應用實例
const app = createApp(App)

// 創建 Pinia 狀態管理實例
const pinia = createPinia()

// 註冊插件
app.use(pinia) // 必須在 router 之前註冊，因為 router 可能會用到 store
app.use(router)

// 掛載應用
app.mount('#app')

// 初始化認證狀態
// 在應用啟動時檢查是否有已保存的登入狀態
const authStore = useAuthStore()
authStore.initAuth()
