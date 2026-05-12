<template>
  <div class="coupons-view">
    <!-- 頂部導航欄（沿用所有文章風格） -->
    <nav class="top-navbar">
      <div class="navbar-content">
        <router-link to="/coupons" class="navbar-logo">
          🎟️ Vue3 Demo
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

    <!-- 內容容器 -->
    <div class="coupons-container">
      <div class="header">
        <div class="header-content">
          <h1>🎟️ 優惠券</h1>
          <p class="subtitle">查看目前可使用/可領取的優惠券</p>
        </div>
      </div>

      <!-- 最上層：每頁筆數 -->
      <div class="filters-section">
        <div class="filter-group">
          <label class="filter-label">每頁顯示：</label>
          <div class="filter-buttons">
            <button
              v-for="size in [10, 20, 30, 40, 50]"
              :key="size"
              :class="['filter-btn', { active: perPage === size }]"
              @click="changePerPage(size)"
              :disabled="couponStore.loading"
            >
              {{ size }} 筆
            </button>
          </div>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="couponStore.loading" class="loading-state">
        <p>載入中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="couponStore.error" class="error-state">
        <p>{{ couponStore.error }}</p>
      </div>

      <!-- 列表 -->
      <div v-else-if="couponStore.coupons.length > 0" class="coupons-grid">
        <div
          v-for="coupon in couponStore.coupons"
          :key="coupon.id"
          class="coupon-card"
          @click="goToCoupon(coupon.id)"
        >
          <div class="coupon-header">
            <div class="coupon-title">{{ coupon.name }}</div>
            <div
              v-if="authStore.isAuthenticated && getClaimHintText(coupon)"
              :class="['claim-hint', getClaimHintClass(coupon)]"
            >
              {{ getClaimHintText(coupon) }}
            </div>
          </div>

          <div class="coupon-content">
            <div class="coupon-discount">{{ coupon.discount_display }}</div>
            <p class="coupon-desc">{{ coupon.description || '—' }}</p>
          </div>

          <div class="coupon-footer">
            <div class="coupon-meta">
              <span class="meta-item">剩餘：{{ coupon.remaining_quantity ?? '—' }}</span>
              <span class="meta-item">每人限領：{{ coupon.per_user_limit ?? '—' }}</span>
              <span class="meta-item">低消：{{ formatMoney(coupon.min_order_amount) }}</span>
            </div>

            <div v-if="authStore.isAuthenticated && coupon.can_claim" class="coupon-actions">
              <button
                type="button"
                class="btn-claim"
                @click.stop="goToCoupon(coupon.id)"
              >
                領取
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <p>目前沒有優惠券</p>
      </div>

      <!-- 最下層：頁面標籤（照舊） -->
      <div v-if="couponStore.coupons.length > 0 && pagination.last_page > 1" class="pagination">
        <button
          @click="changePage(1)"
          :disabled="currentPage === 1 || couponStore.loading"
          class="pagination-btn"
          title="第一頁"
        >
          第一頁
        </button>

        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || couponStore.loading"
          class="pagination-btn"
        >
          上一頁
        </button>

        <div class="pagination-pages">
          <button
            v-for="page in getPaginationPages()"
            :key="page"
            @click="changePage(page)"
            :class="['pagination-page', { active: page === currentPage }]"
            :disabled="couponStore.loading || page === '...'"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === pagination.last_page || couponStore.loading"
          class="pagination-btn"
        >
          下一頁
        </button>

        <button
          @click="changePage(pagination.last_page)"
          :disabled="currentPage === pagination.last_page || couponStore.loading"
          class="pagination-btn"
          title="最後一頁"
        >
          最後一頁
        </button>

        <div class="pagination-info">
          第 {{ currentPage }} / {{ pagination.last_page }} 頁，
          共 {{ pagination.total }} 張優惠券
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 優惠券列表頁（前台）
 * 僅包含：每頁筆數 + 分頁標籤（沿用所有文章頁風格）
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCouponStore } from '@/store/coupon.store'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const couponStore = useCouponStore()
const authStore = useAuthStore()

const perPage = ref(15)
const currentPage = ref(1)

const pagination = computed(() => couponStore.pagination)

const fetchCoupons = async (page = 1) => {
  await couponStore.fetchCoupons({
    per_page: perPage.value,
    page,
  })
}

const changePerPage = async (size) => {
  perPage.value = size
  currentPage.value = 1
  await fetchCoupons(1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const changePage = async (page) => {
  if (page < 1 || page > pagination.value.last_page || page === '...') return
  currentPage.value = page
  await fetchCoupons(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getPaginationPages = () => {
  const total = pagination.value.last_page
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
}

const goToCoupon = (couponId) => {
  router.push(`/coupons/${couponId}`)
}

const getClaimHintText = (coupon) => {
  if (coupon.is_claimed) return '已領取'
  if (coupon.can_claim) return '可領取'
  return ''
}

const getClaimHintClass = (coupon) => {
  if (coupon.is_claimed) return 'claimed'
  if (coupon.can_claim) return 'claimable'
  return ''
}

const formatMoney = (value) => {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return '—'
  return numberValue <= 0 ? '無' : `$${numberValue}`
}

onMounted(() => {
  fetchCoupons(1)
})
</script>

<style scoped>
.coupons-view {
  min-height: 100vh;
  background: #f5f6fa;
}

/* 頂部導航欄（沿用所有文章樣式） */
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

/* 容器 */
.coupons-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

/* 最上層：每頁筆數 */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  color: #2c3e50;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #e74c3c;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* 卡片網格 */
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.coupon-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.coupon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: #fafbfc;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.coupon-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1.35;
}

.claim-hint {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
  border: 2px solid #e0e0e0;
  white-space: nowrap;
}

.claim-hint.claimable {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}

.claim-hint.claimed {
  border-color: rgba(102, 126, 234, 0.35);
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}

.coupon-discount {
  font-size: 1.6rem;
  font-weight: 900;
  color: #667eea;
  margin-bottom: 10px;
}

.coupon-desc {
  color: #2c3e50;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 16px;
}

.coupon-footer {
  margin-top: auto;
}

.coupon-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #7f8c8d;
  font-weight: 600;
}

.meta-item {
  background: #f5f6fa;
  padding: 6px 10px;
  border-radius: 8px;
}

.coupon-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.btn-claim {
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 800;
  border: 2px solid #667eea;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-claim:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

/* 分頁（沿用所有文章頁樣式） */
.pagination {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination-btn {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pagination-page {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 700;
  min-width: 44px;
}

.pagination-page:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-page.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.pagination-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  width: 100%;
  text-align: center;
  color: #7f8c8d;
  font-weight: 600;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 15px 20px;
  }

  .coupons-container {
    padding: 20px;
  }

  .header-content h1 {
    font-size: 2rem;
  }
}
</style>
