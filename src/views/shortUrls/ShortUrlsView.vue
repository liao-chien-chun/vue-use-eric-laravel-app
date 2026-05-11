<template>
  <div class="short-urls-view">
    <div class="header">
      <h1>短網址管理</h1>
      <button @click="showCreateForm = true" class="btn btn-primary">
        建立短網址
      </button>
    </div>

    <!-- 建立短網址表單 -->
    <div v-if="showCreateForm" class="create-form">
      <h2>建立新的短網址</h2>

      <!-- 錯誤訊息 -->
      <div v-if="shortUrlStore.error" class="error-message">
        {{ shortUrlStore.error }}
      </div>

      <form @submit.prevent="handleCreate">
        <div class="form-group">
          <label>原始網址 *</label>
          <input
            v-model="form.original_url"
            type="url"
            placeholder="https://example.com"
            required
            :disabled="shortUrlStore.loading"
          />
        </div>
        <div class="form-group">
          <label>自訂短碼（可選）</label>
          <input
            v-model="form.short_code"
            type="text"
            placeholder="my-link"
            :disabled="shortUrlStore.loading"
          />
          <small class="form-hint">留空則自動生成</small>
        </div>
        <div class="form-group">
          <label>過期時間（可選）</label>
          <input
            v-model="form.expired_at"
            type="datetime-local"
            :disabled="shortUrlStore.loading"
          />
          <small class="form-hint">留空則永不過期，格式: YYYY-MM-DD HH:MM</small>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="shortUrlStore.loading">
            {{ shortUrlStore.loading ? '建立中...' : '建立' }}
          </button>
          <button type="button" @click="cancelCreate" class="btn btn-secondary" :disabled="shortUrlStore.loading">
            取消
          </button>
        </div>
      </form>
    </div>

    <!-- 載入中 -->
    <LoadingSpinner v-if="shortUrlStore.loading && !showCreateForm" text="載入中..." />

    <!-- 短網址列表 -->
    <div v-else-if="shortUrlStore.shortUrls.length > 0" class="urls-list">
      <div v-for="url in shortUrlStore.shortUrls" :key="url.id" class="url-card">
        <div class="url-info">
          <div class="short-url">
            <strong>短網址：</strong>
            <a :href="url.short_url" target="_blank">{{ url.short_url }}</a>
            <button @click="copyToClipboard(url.short_url)" class="btn-copy">
              複製
            </button>
          </div>
          <div class="original-url">
            <strong>原始網址：</strong>
            <span>{{ truncate(url.original_url, 80) }}</span>
          </div>
          <div class="url-stats">
            <span>點擊次數：{{ url.click_count || 0 }}</span>
            <span>建立時間：{{ formatDate(url.created_at, 'date') }}</span>
            <span v-if="url.expired_at" :class="['expire-time', { expired: isExpired(url.expired_at) }]">
              {{ isExpired(url.expired_at) ? '已過期' : `過期時間：${formatDate(url.expired_at, 'datetime')}` }}
            </span>
            <span v-else class="no-expire">永不過期</span>
          </div>
        </div>
        <button @click="handleDelete(url.id)" class="btn-delete">
          刪除
        </button>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <p>還沒有短網址，建立第一個吧！</p>
    </div>
  </div>
</template>

<script setup>
/**
 * 短網址管理頁面
 */

import { ref, onMounted } from 'vue'
import { useShortUrlStore } from '@/store/shortUrl.store'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatDate, truncate } from '@/utils/format'

const shortUrlStore = useShortUrlStore()
const showCreateForm = ref(false)

const form = ref({
  original_url: '',
  short_code: '',
  expired_at: '',
})

/**
 * 處理建立短網址
 */
const handleCreate = async () => {
  // 清除舊的錯誤訊息
  shortUrlStore.error = null

  // 準備發送的資料
  const data = {
    original_url: form.value.original_url,
    short_code: form.value.short_code || undefined, // 空字串轉為 undefined
  }

  // 如果有填寫過期時間，轉換格式並加入
  if (form.value.expired_at) {
    // datetime-local 格式: 2025-01-15T14:30
    // 後端需要格式: 2025-01-15 14:30:00
    const dateTime = form.value.expired_at.replace('T', ' ') + ':00'
    data.expired_at = dateTime
  }

  const success = await shortUrlStore.createShortUrl(data)
  if (success) {
    cancelCreate()
  }
}

/**
 * 取消建立
 */
const cancelCreate = () => {
  showCreateForm.value = false
  form.value = { original_url: '', short_code: '', expired_at: '' }
  shortUrlStore.error = null
}

const handleDelete = async (id) => {
  if (confirm('確定要刪除這個短網址嗎？')) {
    await shortUrlStore.deleteShortUrl(id)
  }
}

/**
 * 複製到剪貼簿
 */
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('已複製到剪貼簿！')
}

/**
 * 檢查是否已過期
 * @param {string} expiredAt - 過期時間
 * @returns {boolean}
 */
const isExpired = (expiredAt) => {
  if (!expiredAt) return false
  return new Date(expiredAt) < new Date()
}

onMounted(() => {
  shortUrlStore.fetchShortUrls()
})
</script>

<style scoped>
.short-urls-view {
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
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
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.create-form h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 5px;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.95rem;
  border: 1px solid #fcc;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.urls-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.url-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.url-info {
  flex: 1;
}

.short-url,
.original-url {
  margin-bottom: 10px;
}

.short-url a {
  color: #667eea;
  text-decoration: none;
  margin: 0 10px;
}

.btn-copy {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.btn-copy:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.btn-copy:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.url-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 10px;
}

.expire-time {
  color: #f39c12;
  font-weight: 600;
}

.expire-time.expired {
  color: #e74c3c;
}

.no-expire {
  color: #27ae60;
  font-weight: 600;
}

.btn-delete {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete:hover {
  background: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}
</style>
