<template>
  <div class="post-detail-view">
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
            <div class="comment-header">
              <div class="comment-author">
                <div class="avatar">{{ comment.user?.name?.charAt(0).toUpperCase() || '?' }}</div>
                <div class="comment-meta">
                  <div class="author-name">{{ comment.user?.name || '匿名用戶' }}</div>
                  <div class="comment-date">{{ formatDate(comment.created_at, 'datetime') }}</div>
                </div>
              </div>
              <!-- 只有自己的留言才能編輯 -->
              <div v-if="canEditComment(comment)" class="comment-actions">
                <button
                  v-if="editingCommentId !== comment.id"
                  @click="startEditComment(comment)"
                  class="btn-edit"
                >
                  編輯
                </button>
              </div>
            </div>

            <!-- 顯示模式 -->
            <div v-if="editingCommentId !== comment.id" class="comment-content">
              {{ comment.content }}
            </div>

            <!-- 編輯模式 -->
            <div v-else class="comment-edit-form">
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

/**
 * 當前文章
 */
const currentPost = computed(() => postStore.currentPost)

/**
 * 檢查是否可以編輯留言
 */
const canEditComment = (comment) => {
  return authStore.isAuthenticated && comment.user_id === authStore.user?.id
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
    comments.value = response.data || []
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
    const response = await postAPI.addComment(postId, {
      content: newCommentContent.value
    })

    // 添加新留言到列表（包含用戶信息）
    comments.value.push({
      ...response.data,
      user: {
        id: authStore.user.id,
        name: authStore.user.name
      }
    })

    newCommentContent.value = ''
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
    const response = await postAPI.updateComment(postId, commentId, {
      content: editingCommentContent.value
    })

    // 更新列表中的留言
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value[index] = {
        ...comments.value[index],
        ...response.data
      }
    }

    cancelEditComment()
  } catch (error) {
    console.error('❌ 更新留言失敗:', error)
    alert('更新留言失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchPost()
  fetchComments()
})
</script>

<style scoped>
.post-detail-view {
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

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
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

.comment-author {
  display: flex;
  gap: 10px;
  align-items: center;
}

.comment-meta {
  display: flex;
  flex-direction: column;
}

.comment-date {
  color: #95a5a6;
  font-size: 0.85rem;
}

.comment-content {
  color: #2c3e50;
  line-height: 1.6;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.btn-edit {
  padding: 6px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit:hover {
  background: #2980b9;
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
