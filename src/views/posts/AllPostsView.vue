<template>
  <div class="all-posts-view">
    <!-- 頂部導航欄 -->
    <nav class="top-navbar">
      <div class="navbar-content">
        <router-link to="/posts" class="navbar-logo">
          📰 Vue3 Demo
        </router-link>

        <div class="navbar-actions">
          <!-- 已登入：顯示個人專區按鈕 -->
          <router-link v-if="authStore.isAuthenticated && !authStore.isAdmin" to="/dashboard" class="btn-dashboard">
            個人專區
          </router-link>

          <!-- 未登入：顯示登入/註冊按鈕 -->
          <template v-else-if="!authStore.isAuthenticated">
            <router-link to="/login" class="btn-login">登入</router-link>
            <router-link to="/register" class="btn-register">註冊</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- 文章列表內容容器 -->
    <div class="posts-container">
      <div class="header">
        <div class="header-content">
          <h1>📰 所有文章</h1>
          <p class="subtitle">探索社群中的精彩內容</p>
        </div>
      </div>

      <!-- 搜尋和篩選區 -->
      <div class="filters-section">
        <!-- 搜尋框 -->
        <div class="search-box">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜尋文章標題或內容..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="btn-search">
            🔍 搜尋
          </button>
        </div>

        <!-- 排序選項 -->
        <div class="filter-group">
          <label class="filter-label">排序方式：</label>
          <div class="filter-buttons">
            <button
              :class="['filter-btn', { active: sortBy === 'created_at' }]"
              @click="sortBy = 'created_at'"
            >
              建立日期
            </button>
            <button
              :class="['filter-btn', { active: sortBy === 'views_count' }]"
              @click="sortBy = 'views_count'"
            >
              觀看數
            </button>
            <button
              :class="['filter-btn', { active: sortBy === 'comments_count' }]"
              @click="sortBy = 'comments_count'"
            >
              留言數
            </button>
          </div>
        </div>

        <!-- 排序方向 -->
        <div class="filter-group">
          <label class="filter-label">排序方向：</label>
          <div class="filter-buttons">
            <button
              :class="['filter-btn', { active: order === 'desc' }]"
              @click="order = 'desc'"
            >
              ↓ 降序
            </button>
            <button
              :class="['filter-btn', { active: order === 'asc' }]"
              @click="order = 'asc'"
            >
              ↑ 升序
            </button>
          </div>
        </div>

        <!-- 每頁筆數 -->
        <div class="filter-group">
          <label class="filter-label">每頁顯示：</label>
          <div class="filter-buttons">
            <button
              v-for="size in [10, 20, 30, 40, 50]"
              :key="size"
              :class="['filter-btn', { active: perPage === size }]"
              @click="perPage = size"
            >
              {{ size }} 筆
            </button>
          </div>
        </div>

        <!-- 套用篩選按鈕 -->
        <button @click="applyFilters" class="btn-apply" :disabled="postStore.loading">
          套用篩選
        </button>
      </div>

      <!-- 載入中 -->
      <div v-if="postStore.loading" class="loading-state">
        <p>載入中...</p>
      </div>

    <!-- 文章列表 -->
    <div v-else-if="postStore.posts.length > 0" class="posts-grid">
      <div v-for="post in postStore.posts" :key="post.id" class="post-card" @click="goToPost(post.id)">
        <div class="post-header">
          <div class="author-info">
            <div class="author-name">{{ post.user.name }}</div>
            <div class="post-date">{{ formatDate(post.created_at, 'date') }}</div>
          </div>
        </div>

        <div class="post-content">
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ truncate(post.content, 150) }}</p>
        </div>

        <div class="post-footer">
          <div class="post-stats">
            <span class="stat-item">👁️ {{ post.views_count || 0 }} 次瀏覽</span>
            <span class="stat-item">💬 {{ post.comments_count || 0 }} 則留言</span>
          </div>
        </div>
      </div>
    </div>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <p>{{ keyword ? '找不到符合的文章' : '目前還沒有文章，快去新增第一篇吧！' }}</p>
        <router-link v-if="authStore.isAuthenticated && !keyword" to="/posts/create" class="btn btn-primary">
          新增文章
        </router-link>
      </div>

      <!-- 分頁 -->
      <div v-if="postStore.posts.length > 0 && pagination.last_page > 1" class="pagination">
        <!-- 第一頁按鈕 -->
        <button
          @click="changePage(1)"
          :disabled="currentPage === 1 || postStore.loading"
          class="pagination-btn"
          title="第一頁"
        >
          第一頁
        </button>

        <!-- 上一頁按鈕 -->
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || postStore.loading"
          class="pagination-btn"
        >
          上一頁
        </button>

        <!-- 頁碼按鈕 -->
        <div class="pagination-pages">
          <button
            v-for="page in getPaginationPages()"
            :key="page"
            @click="changePage(page)"
            :class="['pagination-page', { active: page === currentPage }]"
            :disabled="postStore.loading || page === '...'"
          >
            {{ page }}
          </button>
        </div>

        <!-- 下一頁按鈕 -->
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === pagination.last_page || postStore.loading"
          class="pagination-btn"
        >
          下一頁
        </button>

        <!-- 最後一頁按鈕 -->
        <button
          @click="changePage(pagination.last_page)"
          :disabled="currentPage === pagination.last_page || postStore.loading"
          class="pagination-btn"
          title="最後一頁"
        >
          最後一頁
        </button>

        <!-- 分頁資訊 -->
        <div class="pagination-info">
          第 {{ currentPage }} / {{ pagination.last_page }} 頁，
          共 {{ pagination.total }} 篇文章
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 所有文章頁面（公開前台）
 * 支援搜尋、排序、分頁
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/store/post.store'
import { useAuthStore } from '@/store/auth.store'
import { formatDate, truncate } from '@/utils/format'

const router = useRouter()
const postStore = usePostStore()
const authStore = useAuthStore()

/**
 * 搜尋和篩選條件
 */
const keyword = ref('')
const sortBy = ref('created_at')
const order = ref('desc')
const perPage = ref(10)
const currentPage = ref(1)

/**
 * 分頁資訊
 */
const pagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

/**
 * 點擊文章卡片，進入詳情頁
 */
const goToPost = (postId) => {
  router.push(`/posts/${postId}`)
}

/**
 * 獲取所有文章
 */
const fetchPosts = async (page = 1) => {
  const params = {
    page,
    per_page: perPage.value
  }

  // 添加關鍵字搜尋
  if (keyword.value.trim()) {
    params.keyword = keyword.value.trim()
  }

  // 添加排序
  params.sort_by = sortBy.value
  params.order = order.value

  const response = await postStore.fetchPosts(params)

  // 更新分頁資訊（假設 API 返回分頁資訊）
  if (postStore.pagination) {
    pagination.value = postStore.pagination
  }
}

/**
 * 處理搜尋
 */
const handleSearch = () => {
  currentPage.value = 1
  fetchPosts(1)
}

/**
 * 套用篩選
 */
const applyFilters = () => {
  currentPage.value = 1
  fetchPosts(1)
}

/**
 * 切換頁碼
 */
const changePage = async (page) => {
  if (page < 1 || page > pagination.value.last_page || page === '...') return
  currentPage.value = page
  await fetchPosts(page)
  // 滾動到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 生成分頁頁碼陣列
 * 最多顯示 7 個頁碼
 */
const getPaginationPages = () => {
  const total = pagination.value.last_page
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    // 總頁數 <= 7，顯示全部
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 總頁數 > 7，智能顯示
    if (current <= 4) {
      // 當前頁靠前：1 2 3 4 5 ... 最後
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 當前頁靠後：1 ... 倒數5 倒數4 倒數3 倒數2 最後
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      // 當前頁在中間：1 ... 前 當前 後 ... 最後
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
}

onMounted(() => {
  fetchPosts()
})

</script>

<style scoped>
.all-posts-view {
  min-height: 100vh;
  background: #f5f6fa;
}

/* 頂部導航欄 */
.top-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s;
}

.navbar-logo:hover {
  color: #5568d3;
}

.navbar-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.btn-dashboard,
.btn-login,
.btn-register {
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-dashboard {
  background: #667eea;
  color: white;
}

.btn-dashboard:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-login {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-login:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.btn-register {
  background: #667eea;
  color: white;
}

.btn-register:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 文章列表容器 */
.posts-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 文章網格佈局 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

/* 文章卡片 */
.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: #fafbfc;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* 文章頭部 */
.post-header {
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.post-date {
  color: #95a5a6;
  font-size: 0.85rem;
}

/* 文章內容 */
.post-content {
  flex: 1;
  margin-bottom: 16px;
}

.post-title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-excerpt {
  color: #7f8c8d;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 文章底部 */
.post-footer {
  border-top: 1px solid #ecf0f1;
  padding-top: 16px;
}

.post-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  color: #95a5a6;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 搜尋和篩選區 */
.filters-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

/* 搜尋框 */
.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-search {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-search:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 篩選組 */
.filter-group {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 100px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 20px;
  background: white;
  color: #7f8c8d;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 套用按鈕 */
.btn-apply {
  width: 100%;
  padding: 14px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn-apply:hover:not(:disabled) {
  background: #229954;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-apply:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* 分頁樣式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 10px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.pagination-btn:disabled {
  background: #e0e0e0;
  color: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.pagination-pages {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pagination-page {
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  background: white;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover:not(:disabled):not(.active) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.pagination-page.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.pagination-page:disabled {
  cursor: default;
  border-color: transparent;
  background: transparent;
}

.pagination-info {
  width: 100%;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ecf0f1;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .navbar-content {
    padding: 15px 20px;
  }

  .navbar-logo {
    font-size: 1.2rem;
  }

  .navbar-actions {
    gap: 10px;
  }

  .btn-dashboard,
  .btn-login,
  .btn-register {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .posts-container {
    padding: 30px 20px;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .header-content h1 {
    font-size: 2rem;
  }

  /* 篩選區響應式 */
  .filters-section {
    padding: 20px;
  }

  .search-box {
    flex-direction: column;
  }

  .btn-search {
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-label {
    min-width: auto;
  }

  .filter-buttons {
    width: 100%;
  }

  .filter-btn {
    flex: 1;
    min-width: 60px;
  }

  /* 分頁響應式 */
  .pagination {
    gap: 8px;
    padding: 15px;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  /* 手機端隱藏文字，只顯示符號 */
  .pagination-btn:first-child::before {
    content: '⏮';
  }
  .pagination-btn:last-of-type::before {
    content: '⏭';
  }
  .pagination-btn:first-child,
  .pagination-btn:last-of-type {
    font-size: 0;
  }
  .pagination-btn:first-child::before,
  .pagination-btn:last-of-type::before {
    font-size: 1rem;
  }

  .pagination-page {
    min-width: 34px;
    height: 34px;
    font-size: 0.85rem;
  }

  .pagination-info {
    font-size: 0.85rem;
  }
}
</style>
