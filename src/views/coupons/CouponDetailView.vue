<template>
  <div class="coupon-detail-view">
    <!-- 頂部導航欄（沿用所有文章風格） -->
    <nav class="top-navbar">
      <div class="navbar-content">
        <router-link to="/coupons" class="navbar-logo">
          🎟️ Vue3 Demo
        </router-link>

        <div class="navbar-actions">
          <router-link v-if="authStore.isAuthenticated && !authStore.isAdmin" to="/dashboard" class="btn-dashboard">
            個人專區
          </router-link>

          <template v-else-if="!authStore.isAuthenticated">
            <router-link to="/login" class="btn-login">登入</router-link>
            <router-link to="/register" class="btn-register">註冊</router-link>
          </template>
        </div>
      </div>
    </nav>

    <div class="detail-container">
      <div class="header">
        <router-link to="/coupons" class="btn-back">← 返回列表</router-link>
      </div>

      <div v-if="couponStore.loading" class="loading-state">
        <p>載入中...</p>
      </div>

      <div v-else-if="coupon" class="coupon-container">
        <div class="coupon-card">
          <div class="coupon-top">
            <h1 class="coupon-title">{{ coupon.name }}</h1>
            <div
              v-if="authStore.isAuthenticated && getClaimHintText(coupon)"
              :class="['claim-hint', getClaimHintClass(coupon)]"
            >
              {{ getClaimHintText(coupon) }}
            </div>
          </div>

          <div v-if="authStore.isAuthenticated && coupon.can_claim" class="coupon-actions">
            <button
              type="button"
              class="btn-claim"
            >
              領取
            </button>
          </div>

          <div class="coupon-code">代碼：{{ coupon.code }}</div>

          <div class="coupon-discount">{{ coupon.discount_display }}</div>

          <div class="coupon-desc">
            {{ coupon.description || '—' }}
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="label">折扣類型</div>
              <div class="value">{{ coupon.discount_type_text || coupon.discount_type || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="label">折扣數值</div>
              <div class="value">{{ coupon.discount_value ?? '—' }}</div>
            </div>
            <div class="info-item">
              <div class="label">低消</div>
              <div class="value">{{ formatMoney(coupon.min_order_amount) }}</div>
            </div>
            <div class="info-item">
              <div class="label">剩餘數量</div>
              <div class="value">{{ coupon.remaining_quantity ?? '—' }}</div>
            </div>
            <div class="info-item">
              <div class="label">每人限領</div>
              <div class="value">{{ coupon.per_user_limit ?? '—' }}</div>
            </div>
            <div class="info-item">
              <div class="label">開始時間</div>
              <div class="value">{{ coupon.start_at || '—' }}</div>
            </div>
            <div class="info-item">
              <div class="label">結束時間</div>
              <div class="value">{{ coupon.end_at || '—' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <p>{{ couponStore.error || '優惠券不存在' }}</p>
        <router-link to="/coupons" class="btn btn-primary">返回列表</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 優惠券詳情頁（前台）
 */

import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCouponStore } from '@/store/coupon.store'
import { useAuthStore } from '@/store/auth.store'

const route = useRoute()
const couponStore = useCouponStore()
const authStore = useAuthStore()

const couponId = route.params.id

const coupon = computed(() => couponStore.currentCoupon)

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
  couponStore.fetchCoupon(couponId)
})
</script>

<style scoped>
.coupon-detail-view {
  min-height: 100vh;
  background: #f5f6fa;
}

/* navbar：沿用所有文章樣式 */
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

.detail-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px;
}

.header {
  margin-bottom: 20px;
}

.btn-back {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.3);
  background: white;
  transition: all 0.3s;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.coupon-container {
  background: transparent;
}

.coupon-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 28px;
}

.coupon-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.coupon-title {
  font-size: 2rem;
  color: #2c3e50;
  line-height: 1.25;
}

.claim-hint {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.9rem;
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

.coupon-code {
  color: #7f8c8d;
  font-weight: 700;
  margin-bottom: 16px;
}

.coupon-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
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

.coupon-discount {
  font-size: 2.2rem;
  font-weight: 900;
  color: #667eea;
  margin-bottom: 12px;
}

.coupon-desc {
  color: #2c3e50;
  line-height: 1.7;
  opacity: 0.95;
  margin-bottom: 22px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.info-item {
  background: #f5f6fa;
  border-radius: 12px;
  padding: 14px 16px;
}

.label {
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 6px;
}

.value {
  color: #2c3e50;
  font-weight: 700;
}

.error-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #e74c3c;
  font-weight: 700;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
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

@media (max-width: 768px) {
  .navbar-content {
    padding: 15px 20px;
  }

  .detail-container {
    padding: 20px;
  }

  .coupon-title {
    font-size: 1.6rem;
  }
}
</style>
