<template>
  <div class="post-form-view">
    <div class="header">
      <h1>{{ isEdit ? '編輯文章' : '新增文章' }}</h1>
      <router-link to="/posts/my" class="btn-back">← 返回列表</router-link>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- 標題 -->
        <div class="form-group">
          <label for="title">標題 *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="請輸入文章標題"
            required
            :disabled="postStore.loading"
          />
        </div>

        <!-- 內容 -->
        <div class="form-group">
          <label for="content">內容 *</label>
          <textarea
            id="content"
            v-model="form.content"
            rows="15"
            placeholder="請輸入文章內容"
            required
            :disabled="postStore.loading"
          ></textarea>
        </div>

        <!-- 狀態 -->
        <div class="form-group">
          <label for="status">狀態</label>
          <select
            id="status"
            v-model.number="form.status"
            :disabled="postStore.loading"
          >
            <option v-for="option in availableStatusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="postStore.error" class="error-message">
          {{ postStore.error }}
        </div>

        <!-- 按鈕 -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="postStore.loading"
          >
            {{ postStore.loading ? '儲存中...' : (isEdit ? '更新文章' : '新增文章') }}
          </button>
          <router-link to="/posts/my" class="btn btn-secondary">
            取消
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
/**
 * 文章表單頁（新增/編輯）
 */

import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePostStore } from '@/store/post.store'

const router = useRouter()
const route = useRoute()
const postStore = usePostStore()

const postId = route.params.id
const isEdit = computed(() => !!postId)

const form = ref({
  title: '',
  content: '',
  status: 1, // 預設為草稿
})

/**
 * 記錄文章的原始狀態
 */
const originalStatus = ref(null)

/**
 * 根據當前狀態計算可選的狀態選項
 *
 * 狀態轉換規則：
 * - 新增模式：只能選擇草稿(1)或發布(2)
 * - 草稿(1)：可選草稿(1)或發布(2)
 * - 發布(2)：可選發布(2)或隱藏(3)
 * - 隱藏(3)：可選隱藏(3)或發布(2)
 */
const availableStatusOptions = computed(() => {
  // 新增模式：只能選擇草稿或發布
  if (!isEdit.value) {
    return [
      { value: 1, label: '草稿' },
      { value: 2, label: '發布' }
    ]
  }

  // 編輯模式：根據原始狀態決定可選項
  const status = originalStatus.value

  if (status === 1) {
    // 草稿：可選草稿或發布
    return [
      { value: 1, label: '草稿' },
      { value: 2, label: '發布' }
    ]
  } else if (status === 2) {
    // 發布：可選發布或隱藏
    return [
      { value: 2, label: '發布' },
      { value: 3, label: '隱藏' }
    ]
  } else if (status === 3) {
    // 隱藏：可選隱藏或發布
    return [
      { value: 3, label: '隱藏' },
      { value: 2, label: '發布' }
    ]
  }

  // 預設返回草稿和發布
  return [
    { value: 1, label: '草稿' },
    { value: 2, label: '發布' }
  ]
})

/**
 * 載入文章資料（編輯模式）
 */
const loadPost = async () => {
  if (isEdit.value) {
    const success = await postStore.fetchMyPost(postId)
    if (success && postStore.currentPost) {
      // 記錄原始狀態
      originalStatus.value = postStore.currentPost.status

      form.value = {
        title: postStore.currentPost.title,
        content: postStore.currentPost.content,
        status: postStore.currentPost.status,
      }
    }
  }
}

/**
 * 處理提交
 */
const handleSubmit = async () => {
  let success = false

  if (isEdit.value) {
    // 更新文章
    success = await postStore.updatePost(postId, form.value)
  } else {
    // 新增文章
    success = await postStore.createPost(form.value)
  }

  if (success) {
    router.push('/posts/my')
  }
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.post-form-view {
  max-width: 800px;
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

.btn-back {
  padding: 10px 20px;
  background: #f8f9fa;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 6px;
  border: 1px solid #ddd;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #e9ecef;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 300px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  text-decoration: none;
  display: inline-block;
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

.btn-secondary:hover {
  background: #e9ecef;
}
</style>
