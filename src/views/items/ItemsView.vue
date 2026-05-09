<template>
  <div class="items-view">
    <div class="header">
      <h1>商品管理</h1>
      <button @click="showCreateForm = true" class="btn btn-primary">
        新增商品
      </button>
    </div>

    <!-- 狀態篩選按鈕 -->
    <div class="status-filters">
      <button
        :class="['filter-btn', { active: currentStatus === 2 }]"
        @click="changeStatus(2)"
      >
        上架
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
        下架
      </button>
    </div>

    <!-- 新增商品表單 -->
    <div v-if="showCreateForm" class="modal">
      <div class="modal-content">
        <h2>新增商品</h2>

        <!-- 錯誤訊息 -->
        <div v-if="itemStore.error" class="error-message">
          {{ itemStore.error }}
        </div>

        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>商品名稱 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="請輸入商品名稱"
              required
              :disabled="itemStore.loading"
            />
          </div>
          <div class="form-group">
            <label>價格 *</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="請輸入商品價格"
              required
              :disabled="itemStore.loading"
            />
          </div>
          <div class="form-group">
            <label>庫存數量 *</label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              placeholder="請輸入庫存數量"
              required
              :disabled="itemStore.loading"
            />
          </div>
          <div class="form-group">
            <label>狀態 *</label>
            <select
              v-model.number="form.status"
              required
              :disabled="itemStore.loading"
            >
              <option :value="1">草稿</option>
              <option :value="2">上架</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="itemStore.loading">
              {{ itemStore.loading ? '新增中...' : '新增' }}
            </button>
            <button
              type="button"
              @click="cancelCreate"
              class="btn btn-secondary"
              :disabled="itemStore.loading"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 載入中 -->
    <LoadingSpinner v-if="itemStore.loading && !showCreateForm" text="載入中..." />

    <!-- 商品列表 -->
    <div v-else-if="itemStore.items.length > 0" class="items-grid">
      <div v-for="item in itemStore.items" :key="item.id" class="item-card">
        <div class="card-header">
          <h3>{{ item.name }}</h3>
          <span :class="['status-badge', item.status === 2 ? 'active' : 'draft']">
            {{ item.status === 2 ? '上架' : '草稿' }}
          </span>
        </div>
        <div class="item-info">
          <div class="info-row">
            <span class="label">價格：</span>
            <span class="price">NT$ {{ formatNumber(item.price) }}</span>
          </div>
          <div class="info-row">
            <span class="label">庫存：</span>
            <span :class="['stock', item.stock <= 10 ? 'low' : '']">
              {{ item.stock }} 件
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <p v-if="currentStatus === 2">還沒有上架的商品，新增第一個吧！</p>
      <p v-else-if="currentStatus === 1">目前沒有草稿商品</p>
      <p v-else-if="currentStatus === 3">目前沒有下架的商品</p>
    </div>
  </div>
</template>

<script setup>
/**
 * 商品管理頁面
 */

import { ref, computed, onMounted } from 'vue'
import { useItemStore } from '@/store/item.store'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatNumber } from '@/utils/format'

const itemStore = useItemStore()
const showCreateForm = ref(false)

/**
 * 當前選中的狀態
 * 1 = 草稿, 2 = 上架, 3 = 下架
 * 預設顯示已上架的商品
 */
const currentStatus = ref(2)

/**
 * 從 API 獲取商品列表
 * @param {number} status - 商品狀態
 */
const fetchItems = async (status = 2) => {
  await itemStore.fetchItems({
    status,
    per_page: 15,
    page: 1
  })

  if (itemStore.error) {
    console.error('❌ API 錯誤:', itemStore.error)
  }
}

/**
 * 切換狀態
 * @param {number} status - 商品狀態
 */
const changeStatus = async (status) => {
  currentStatus.value = status
  await fetchItems(status)
}

/**
 * 商品表單資料
 * status: 1=草稿, 2=上架
 */
const form = ref({
  name: '',
  price: 0,
  stock: 0,
  status: 2, // 預設上架
})

/**
 * 處理新增商品
 */
const handleCreate = async () => {
  // 清除舊的錯誤訊息
  itemStore.error = null

  const success = await itemStore.createItem(form.value)
  if (success) {
    cancelCreate()
    // 重新載入當前狀態的商品列表
    await fetchItems(currentStatus.value)
  }
}

/**
 * 取消新增
 */
const cancelCreate = () => {
  showCreateForm.value = false
  form.value = { name: '', price: 0, stock: 0, status: 2 }
  itemStore.error = null
}

onMounted(() => {
  // 預設載入「上架」狀態的商品
  fetchItems(currentStatus.value)
})
</script>

<style scoped>
.items-view {
  max-width: 1200px;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #2c3e50;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ecf0f1;
}

.card-header h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #667eea;
}

.stock {
  font-size: 1.1rem;
  font-weight: 600;
  color: #27ae60;
}

.stock.low {
  color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}
</style>
