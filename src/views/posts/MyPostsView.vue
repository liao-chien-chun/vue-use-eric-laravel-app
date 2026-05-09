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

    <!-- 空狀態 -->
    <div v-else class="empty-state">
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
 * 獲取我的文章
 * @param {number} status - 文章狀態
 */
const fetchMyPosts = async (status = 2) => {
  if (authStore.user?.id) {
    console.log('🔍 Debug - 當前用戶 ID:', authStore.user.id)
    console.log('🔍 Debug - 請求狀態:', status)
    console.log('🔍 Debug - Token:', localStorage.getItem('token') ? '已設置' : '未設置')

    await postStore.fetchUserPosts(authStore.user.id, {
      status,
      per_page: 15,
      page: 1
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
  await fetchMyPosts(status)
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
  // 預設載入「發布」狀態的文章
  fetchMyPosts(currentStatus.value)
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
</style>
