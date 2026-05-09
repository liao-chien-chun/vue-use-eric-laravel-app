<template>
  <div class="home-view">
    <h1>歡迎使用 Vue3 Laravel Demo</h1>
    <p class="subtitle">這是一個專業的 Vue3 + Laravel API 整合範例專案</p>

    <div class="features">
      <div class="feature-card">
        <h3>🚀 Vue 3</h3>
        <p>使用最新的 Vue 3 Composition API</p>
      </div>

      <div class="feature-card">
        <h3>🔧 Vite</h3>
        <p>快速的開發伺服器和建置工具</p>
      </div>

      <div class="feature-card">
        <h3>🛣️ Vue Router</h3>
        <p>強大的路由管理系統</p>
      </div>

      <div class="feature-card">
        <h3>🍍 Pinia</h3>
        <p>直觀的狀態管理工具</p>
      </div>

      <div class="feature-card">
        <h3>📡 Axios</h3>
        <p>優雅的 HTTP 請求處理</p>
      </div>

      <div class="feature-card">
        <h3>🎨 專業架構</h3>
        <p>業界標準的資料夾結構</p>
      </div>
    </div>

    <div class="actions">
      <router-link to="/login" class="btn btn-primary">開始使用</router-link>
      <router-link to="/register" class="btn btn-secondary">註冊帳號</router-link>
    </div>
  </div>
</template>

<script setup>
/**
 * 首頁組件
 * 展示應用程式的基本資訊和功能特色
 */
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

// 如果已登入，可以跳轉到 dashboard
const goToDashboard = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 40px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.feature-card {
  background: #f8f9fa;
  padding: 30px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.actions {
  margin-top: 40px;
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
  padding: 12px 32px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover {
  background: #35a372;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #3498db;
  color: white;
}

.btn-secondary:hover {
  background: #2980b9;
  transform: translateY(-2px);
}
</style>
