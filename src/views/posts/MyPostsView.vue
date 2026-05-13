<template>
  <div class="my-posts-view">
    <div class="header">
      <h1>我的文章</h1>
      <router-link to="/posts/create" class="btn btn-primary">
        新增文章
      </router-link>
    </div>

    <!-- 狀態篩選按鈕 -->
    <div class="status-filters">
      <button
        :class="['filter-btn', { active: currentStatus === 2 }]"
        @click="changeStatus(2)"
      >
        發布
      </button>
      <button
        :class="['filter-btn', { active: currentStatus === 1 }]"
        @click="changeStatus(1)"
      >
        草稿
      </button>
      <button
        :class="['filter-btn', { active: currentStatus === 3 }]"
        @click="changeStatus(3)"
      >
        隱藏
      </button>
    </div>

    <!-- 每頁筆數選擇 -->
    <div class="per-page-selector">
      <label class="per-page-label">每頁顯示：</label>
      <div class="per-page-buttons">
        <button
          v-for="size in [10, 20, 30, 40, 50]"
          :key="size"
          :class="['per-page-btn', { active: perPage === size }]"
          @click="changePerPage(size)"
        >
          {{ size }} 筆
        </button>
      </div>
    </div>

    <!-- 載入中 -->
    <LoadingSpinner v-if="postStore.loading" text="載入中..." />

    <!-- 錯誤訊息 -->
    <div v-else-if="postStore.error" class="error">
      {{ postStore.error }}
    </div>

    <!-- 文章列表 -->
    <div v-else-if="postStore.myPosts.length > 0" class="posts-list">
      <div v-for="post in postStore.myPosts" :key="post.id" class="post-card">
        <div class="post-content">
          <h3>{{ post.title }}</h3>
          <p class="post-excerpt">{{ truncate(post.content, 100) }}</p>
          <div class="post-meta">
            <span class="date">{{ formatDate(post.created_at, 'date') }}</span>
            <span :class="['status', getStatusClass(post.status)]">
              {{ getStatusText(post.status) }}
            </span>
          </div>
        </div>
        <div class="post-actions">
          <router-link :to="`/posts/${post.id}/edit`" class="btn-action edit">
            編輯
          </router-link>
          <!-- 狀態轉換按鈕 -->
          <button
            v-if="post.status === 1"
            @click="handleStatusChange(post.id, 2)"
            class="btn-action status-change"
            title="草稿 → 發布"
          >
            發布
          </button>
          <button
            v-else-if="post.status === 2"
            @click="handleStatusChange(post.id, 3)"
            class="btn-action status-change"
            title="發布 → 隱藏"
          >
            隱藏
          </button>
          <button
            v-else-if="post.status === 3"
            @click="handleStatusChange(post.id, 2)"
            class="btn-action status-change"
            title="隱藏 → 發布"
          >
            發布
          </button>
          <button
            @click="handleDelete(post.id)"
            class="btn-action delete"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="postStore.myPosts.length > 0 && postStore.pagination.last_page > 1" class="pagination">
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
        :disabled="currentPage === postStore.pagination.last_page || postStore.loading"
        class="pagination-btn"
      >
        下一頁
      </button>

      <!-- 最後一頁按鈕 -->
      <button
        @click="changePage(postStore.pagination.last_page)"
        :disabled="currentPage === postStore.pagination.last_page || postStore.loading"
        class="pagination-btn"
        title="最後一頁"
      >
        最後一頁
      </button>

      <!-- 分頁資訊（移到下方單獨一行） -->
      <div class="pagination-info">
        第 {{ currentPage }} / {{ postStore.pagination.last_page }} 頁，
        共 {{ postStore.pagination.total }} 篇文章
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="postStore.myPosts.length === 0" class="empty-state">
      <p v-if="currentStatus === 2">還沒有已發布的文章，趕快新增第一篇吧！</p>
      <p v-else-if="currentStatus === 1">目前沒有草稿文章</p>
      <p v-else-if="currentStatus === 3">目前沒有隱藏的文章</p>
      <router-link to="/posts/create" class="btn btn-primary">
        新增文章
      </router-link>
    </div>
  </div>
</template>

<script setup>
/**
 * 我的文章列表頁
 * 顯示使用者自己的文章，可以編輯狀態、刪除文章
 */

import { ref, onMounted } from 'vue'
import { usePostStore } from '@/store/post.store'
import { useAuthStore } from '@/store/auth.store'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatDate, truncate } from '@/utils/format'

const postStore = usePostStore()
const authStore = useAuthStore()

/**
 * 當前選中的狀態
 * 1 = 草稿, 2 = 發布, 3 = 隱藏
 * 預設顯示已發布的文章
 */
const currentStatus = ref(2)

/**
 * 當前頁碼
 */
const currentPage = ref(1)

/**
 * 每頁顯示筆數
 */
// 預設每頁顯示 10 筆（與其他列表頁一致）
const perPage = ref(10)

/**
 * 獲取我的文章
 * @param {number} status - 文章狀態
 * @param {number} page - 頁碼
 */
const fetchMyPosts = async (status = 2, page = 1) => {
  if (authStore.user?.id) {
    console.log('🔍 Debug - 當前用戶 ID:', authStore.user.id)
    console.log('🔍 Debug - 請求狀態:', status)
    console.log('🔍 Debug - 請求頁碼:', page)
    console.log('🔍 Debug - 每頁筆數:', perPage.value)
    console.log('🔍 Debug - Token:', localStorage.getItem('token') ? '已設置' : '未設置')

    await postStore.fetchUserPosts(authStore.user.id, {
      status,
      per_page: perPage.value,
      page
    })

    if (postStore.error) {
      console.error('❌ API 錯誤:', postStore.error)
    }
  }
}

/**
 * 切換狀態
 * @param {number} status - 文章狀態
 */
const changeStatus = async (status) => {
  currentStatus.value = status
  currentPage.value = 1  // 切換狀態時重置為第一頁
  await fetchMyPosts(status, 1)
}

/**
 * 切換頁碼
 * @param {number} page - 頁碼
 */
const changePage = async (page) => {
  if (page < 1 || page > postStore.pagination.last_page) return
  currentPage.value = page
  await fetchMyPosts(currentStatus.value, page)
  // 滾動到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 切換每頁顯示筆數
 * @param {number} size - 每頁筆數
 */
const changePerPage = async (size) => {
  perPage.value = size
  currentPage.value = 1  // 重置為第一頁
  await fetchMyPosts(currentStatus.value, 1)
  // 滾動到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 生成分頁頁碼陣列
 * 最多顯示 7 個頁碼
 */
const getPaginationPages = () => {
  const total = postStore.pagination.last_page
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

/**
 * 處理狀態變更
 * 更新成功後重新載入當前狀態的文章列表
 *
 * 狀態轉換規則：
 * 草稿(1) → 只能變成發布(2)
 * 發布(2) → 只能變成隱藏(3)
 * 隱藏(3) → 只能變成發布(2)
 */
const handleStatusChange = async (postId, newStatus) => {
  // 根據新狀態顯示不同的確認訊息
  let confirmMessage = ''
  if (newStatus === 2) {
    confirmMessage = '確定要發布這篇文章嗎？'
  } else if (newStatus === 3) {
    confirmMessage = '確定要隱藏這篇文章嗎？隱藏後其他人將無法看到。'
  } else {
    confirmMessage = '確定要修改文章狀態嗎？'
  }

  // 顯示確認對話框
  if (!confirm(confirmMessage)) {
    return // 使用者取消，不執行操作
  }

  const success = await postStore.updatePostStatus(postId, newStatus)
  if (success) {
    console.log('✅ 文章狀態已更新')
    // 重新載入當前狀態的文章列表（因為文章可能已經不屬於當前狀態）
    await fetchMyPosts(currentStatus.value)
  }
}

/**
 * 處理刪除
 */
const handleDelete = async (postId) => {
  if (confirm('確定要刪除這篇文章嗎？')) {
    const success = await postStore.deletePost(postId)
    if (success) {
      console.log('✅ 文章已刪除')
    }
  }
}

/**
 * 獲取狀態文字
 * 1 = 草稿, 2 = 已發布, 3 = 隱藏
 */
const getStatusText = (status) => {
  const statusMap = {
    1: '草稿',
    2: '已發布',
    3: '隱藏',
  }
  return statusMap[status] || '未知'
}

/**
 * 獲取狀態 CSS class
 * 1 = draft, 2 = published, 3 = hidden
 */
const getStatusClass = (status) => {
  const classMap = {
    1: 'draft',
    2: 'published',
    3: 'hidden',
  }
  return classMap[status] || ''
}

onMounted(() => {
  // 預設載入「發布」狀態的文章，第一頁
  fetchMyPosts(currentStatus.value, currentPage.value)
})
</script>

<style scoped>
.my-posts-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

/* 狀態篩選按鈕 */
.status-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-btn {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #7f8c8d;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.filter-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 每頁筆數選擇器 */
.per-page-selector {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.per-page-label {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.per-page-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.per-page-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.per-page-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.per-page-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.post-content {
  flex: 1;
}

.post-content h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.post-excerpt {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 15px;
}

.post-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.date {
  color: #95a5a6;
  font-size: 0.9rem;
}

.status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status.published {
  background: #d4edda;
  color: #155724;
}

.status.draft {
  background: #fff3cd;
  color: #856404;
}

.status.hidden {
  background: #f8d7da;
  color: #721c24;
}

.post-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 120px;
}

.btn-action {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  text-align: center;
}

.btn-action.edit {
  background: #3498db;
  color: white;
}

.btn-action.edit:hover {
  background: #2980b9;
}

.btn-action.delete {
  background: #e74c3c;
  color: white;
}

.btn-action.delete:hover {
  background: #c0392b;
}

.btn-action.status-change {
  background: #f39c12;
  color: white;
}

.btn-action.status-change:hover {
  background: #e67e22;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
}

.error {
  background: #fee;
  color: #c33;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
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
  .my-posts-view {
    padding: 20px 10px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .status-filters {
    flex-direction: column;
    padding: 15px;
  }

  .filter-btn {
    width: 100%;
  }

  /* 每頁筆數選擇器 - 手機版 */
  .per-page-selector {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    gap: 10px;
  }

  .per-page-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .per-page-btn {
    flex: 1;
    padding: 8px 10px;
    font-size: 0.85rem;
  }

  .post-card {
    flex-direction: column;
    padding: 20px;
  }

  .post-actions {
    width: 100%;
    flex-direction: row;
    min-width: auto;
  }

  .btn-action {
    flex: 1;
  }

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
