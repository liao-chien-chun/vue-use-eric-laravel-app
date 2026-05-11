<template>
  <div class="post-detail-view">
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

    <!-- 文章詳情內容容器 -->
    <div class="detail-container">
      <div class="header">
        <router-link to="/posts" class="btn-back">← 返回列表</router-link>
      </div>

    <!-- 載入中 -->
    <div v-if="postStore.loading" class="loading-state">
      <p>載入中...</p>
    </div>

    <!-- 文章內容 -->
    <div v-else-if="currentPost" class="post-container">
      <article class="post-article">
        <div class="article-header">
          <h1 class="post-title">{{ currentPost.title }}</h1>
          <div class="post-meta">
            <div class="author-name">{{ currentPost.user.name }}</div>
            <div class="post-date">{{ formatDate(currentPost.created_at, 'datetime') }}</div>
          </div>
        </div>

        <div class="post-content">
          {{ currentPost.content }}
        </div>
      </article>

      <!-- 留言區 -->
      <section class="comments-section">
        <h2>留言 ({{ comments.length }})</h2>

        <!-- 新增留言表單 - 只有登入用戶可見 -->
        <div v-if="authStore.isAuthenticated" class="comment-form">
          <textarea
            v-model="newCommentContent"
            placeholder="寫下你的留言..."
            rows="3"
            :disabled="isSubmitting"
          ></textarea>
          <button
            @click="handleAddComment"
            class="btn btn-primary"
            :disabled="!newCommentContent.trim() || isSubmitting"
          >
            {{ isSubmitting ? '發送中...' : '發送留言' }}
          </button>
        </div>
        <div v-else class="login-prompt">
          <p>請先<router-link to="/login">登入</router-link>才能留言</p>
        </div>

        <!-- 留言列表 -->
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <!-- 顯示模式 -->
            <div v-if="editingCommentId !== comment.id">
              <div class="comment-header">
                <div class="author-name">{{ comment.user?.name || '匿名用戶' }}</div>
                <!-- 只有自己的留言才能編輯與刪除 -->
                <div v-if="canEditComment(comment)" class="comment-actions">
                  <button
                    @click="startEditComment(comment)"
                    class="btn-edit"
                    :disabled="deletingCommentId === comment.id"
                  >
                    編輯
                  </button>
                  <button
                    @click="handleDeleteComment(comment.id)"
                    class="btn-delete"
                    :disabled="deletingCommentId === comment.id"
                  >
                    {{ deletingCommentId === comment.id ? '刪除中...' : '刪除' }}
                  </button>
                </div>
              </div>

              <div class="comment-content">
                {{ comment.content }}
              </div>

              <div class="comment-footer">
                <div class="comment-date">{{ formatDate(comment.created_at, 'datetime') }}</div>
              </div>
            </div>

            <!-- 編輯模式 -->
            <div v-else class="comment-edit-form">
              <div class="comment-header">
                <div class="author-name">{{ comment.user?.name || '匿名用戶' }}</div>
              </div>
              <textarea
                v-model="editingCommentContent"
                rows="3"
                :disabled="isSubmitting"
              ></textarea>
              <div class="edit-actions">
                <button
                  @click="handleUpdateComment(comment.id)"
                  class="btn btn-primary btn-sm"
                  :disabled="!editingCommentContent.trim() || isSubmitting"
                >
                  {{ isSubmitting ? '儲存中...' : '儲存' }}
                </button>
                <button
                  @click="cancelEditComment"
                  class="btn btn-secondary btn-sm"
                  :disabled="isSubmitting"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-comments">
          <p>還沒有留言，成為第一個留言的人吧！</p>
        </div>
      </section>
    </div>

      <!-- 錯誤狀態 -->
      <div v-else class="error-state">
        <p>{{ postStore.error || '文章不存在' }}</p>
        <router-link to="/posts" class="btn btn-primary">返回列表</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 文章詳情頁
 * 顯示文章內容和留言
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePostStore } from '@/store/post.store'
import { useAuthStore } from '@/store/auth.store'
import { postAPI } from '@/api/post.api'
import { formatDate } from '@/utils/format'

const route = useRoute()
const postStore = usePostStore()
const authStore = useAuthStore()

const postId = route.params.id
const comments = ref([])
const newCommentContent = ref('')
const editingCommentId = ref(null)
const editingCommentContent = ref('')
const isSubmitting = ref(false)
const deletingCommentId = ref(null)

/**
 * 當前文章
 */
const currentPost = computed(() => postStore.currentPost)

/**
 * 檢查是否可以編輯留言
 */
const canEditComment = (comment) => {
  return authStore.isAuthenticated && comment.user?.id === authStore.user?.id
}

/**
 * 獲取文章詳情
 */
const fetchPost = async () => {
  await postStore.fetchPost(postId)
}

/**
 * 獲取留言列表
 */
const fetchComments = async () => {
  try {
    const response = await postAPI.getComments(postId)
    // 後端格式: response.data.comments
    const commentsData = response.data?.comments || response.data || []
    comments.value = Array.isArray(commentsData) ? commentsData : []
  } catch (error) {
    console.error('❌ 獲取留言失敗:', error)
    comments.value = []
  }
}

/**
 * 新增留言
 */
const handleAddComment = async () => {
  if (!newCommentContent.value.trim()) return

  isSubmitting.value = true
  try {
    await postAPI.addComment(postId, {
      content: newCommentContent.value
    })

    // 新增成功後清空輸入框
    newCommentContent.value = ''

    // 重新獲取留言列表，確保數據同步
    await fetchComments()
  } catch (error) {
    console.error('❌ 新增留言失敗:', error)
    alert('新增留言失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 開始編輯留言
 */
const startEditComment = (comment) => {
  editingCommentId.value = comment.id
  editingCommentContent.value = comment.content
}

/**
 * 取消編輯留言
 */
const cancelEditComment = () => {
  editingCommentId.value = null
  editingCommentContent.value = ''
}

/**
 * 更新留言
 */
const handleUpdateComment = async (commentId) => {
  if (!editingCommentContent.value.trim()) return

  isSubmitting.value = true
  try {
    await postAPI.updateComment(postId, commentId, {
      content: editingCommentContent.value
    })

    // 取消編輯模式
    cancelEditComment()

    // 重新獲取留言列表，確保數據同步
    await fetchComments()
  } catch (error) {
    console.error('❌ 更新留言失敗:', error)
    alert('更新留言失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 刪除留言
 */
const handleDeleteComment = async (commentId) => {
  const isConfirmed = window.confirm('確定要刪除這則留言嗎？')
  if (!isConfirmed) return

  deletingCommentId.value = commentId
  try {
    await postAPI.deleteComment(postId, commentId)

    if (editingCommentId.value === commentId) {
      cancelEditComment()
    }

    // 重新獲取留言列表，確保數據同步
    await fetchComments()
  } catch (error) {
    console.error('❌ 刪除留言失敗:', error)
    alert('刪除留言失敗，請稍後再試')
  } finally {
    deletingCommentId.value = null
  }
}

/**
 * 記錄文章觀看
 */
const recordView = async () => {
  try {
    await postAPI.recordView(postId)
  } catch (error) {
    // 觀看記錄失敗不影響用戶體驗，只記錄錯誤
    console.error('❌ 記錄觀看失敗:', error)
  }
}

onMounted(() => {
  fetchPost()
  fetchComments()
  recordView()  // 記錄文章觀看
})
</script>

<style scoped>
.post-detail-view {
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

/* 詳情內容容器 */
.detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  margin-bottom: 30px;
}

.btn-back {
  padding: 10px 20px;
  background: #f8f9fa;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 6px;
  border: 1px solid #ddd;
  transition: all 0.3s;
  display: inline-block;
}

.btn-back:hover {
  background: #e9ecef;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.error-state p {
  color: #e74c3c;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* 文章內容 */
.post-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-article {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 2px solid #ecf0f1;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.post-title {
  font-size: 2.5rem;
  color: #2c3e50;
  line-height: 1.3;
  flex: 1;
  margin-right: 20px;
}

.post-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  white-space: nowrap;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.post-date {
  color: #95a5a6;
  font-size: 0.9rem;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-wrap;
}

/* 留言區 */
.comments-section {
  margin-top: 40px;
}

.comments-section h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 10px;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.login-prompt {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 30px;
}

.login-prompt a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.comment-content {
  color: #2c3e50;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 10px;
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
}

.comment-date {
  color: #95a5a6;
  font-size: 0.85rem;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: #3498db;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-delete {
  background: #e74c3c;
}

.btn-delete:hover:not(:disabled) {
  background: #c0392b;
}

.btn-edit:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-edit-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 10px;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.9rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-comments {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
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

  .detail-container {
    padding: 30px 20px;
  }

  .post-title {
    font-size: 1.8rem;
  }

  .article-header {
    flex-direction: column;
    gap: 15px;
  }

  .post-meta {
    align-items: flex-start;
  }

  .post-container {
    padding: 20px;
  }
}
</style>
