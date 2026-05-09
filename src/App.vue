<script setup>
/**
 * 根組件
 * 包含側邊欄導航和路由視圖
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './store/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const sidebarCollapsed = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div id="app">
    <!-- 已登入：顯示側邊欄佈局 -->
    <div v-if="authStore.isAuthenticated" class="app-layout">
      <!-- 側邊欄 -->
      <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
        <div class="sidebar-header">
          <router-link to="/" class="logo">
            {{ sidebarCollapsed ? 'V' : 'Vue3 Demo' }}
          </router-link>
          <button @click="sidebarCollapsed = !sidebarCollapsed" class="toggle-btn">
            {{ sidebarCollapsed ? '→' : '←' }}
          </button>
        </div>

        <div class="user-info">
          <div class="avatar">{{ authStore.userName.charAt(0).toUpperCase() }}</div>
          <div v-if="!sidebarCollapsed" class="user-name">
            {{ authStore.userName }}
          </div>
        </div>

        <nav class="sidebar-nav">
          <!-- 只有非管理者才能看到這些選單 -->
          <router-link v-if="!authStore.isAdmin" to="/posts" class="nav-item">
            <span class="icon">📰</span>
            <span v-if="!sidebarCollapsed">所有文章</span>
          </router-link>
          <router-link v-if="!authStore.isAdmin" to="/posts/my" class="nav-item">
            <span class="icon">📝</span>
            <span v-if="!sidebarCollapsed">我的文章</span>
          </router-link>
          <router-link v-if="!authStore.isAdmin" to="/short-urls" class="nav-item">
            <span class="icon">🔗</span>
            <span v-if="!sidebarCollapsed">短網址</span>
          </router-link>
          <!-- 只有管理者才能看到商品管理 -->
          <router-link v-if="authStore.isAdmin" to="/items" class="nav-item">
            <span class="icon">🛍️</span>
            <span v-if="!sidebarCollapsed">商品管理</span>
          </router-link>
          <!-- 所有人都能看到登出 -->
          <button @click="handleLogout" class="nav-item logout">
            <span class="icon">🚪</span>
            <span v-if="!sidebarCollapsed">登出</span>
          </button>
        </nav>
      </aside>

      <!-- 主要內容區 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- 未登入：全屏顯示 -->
    <div v-else class="guest-layout">
      <router-view />
    </div>
  </div>
</template>

<style>
/* 全域樣式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f6fa;
  color: #2c3e50;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

/* 應用佈局（已登入） */
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* 側邊欄 */
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  transition: width 0.3s;
  overflow-x: hidden;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  white-space: nowrap;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.user-info {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 10px;
}

.user-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 1rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  border-left: 4px solid white;
}

.nav-item .icon {
  font-size: 1.3rem;
  min-width: 24px;
}

.nav-item.logout {
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 主要內容區 */
.main-content {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s;
  min-height: 100vh;
  background: #f5f6fa;
}

.sidebar.collapsed ~ .main-content {
  margin-left: 80px;
}

/* 訪客佈局（未登入） */
.guest-layout {
  min-height: 100vh;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }

  .sidebar-header .logo,
  .user-name,
  .nav-item span:not(.icon) {
    display: none;
  }

  .main-content {
    margin-left: 80px;
  }
}
</style>
