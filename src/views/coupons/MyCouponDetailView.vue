<template>
  <div class="my-coupon-detail-view">
    <div class="header">
      <router-link to="/coupons/my" class="btn-back">← 返回我的優惠券</router-link>
      <h1>優惠券詳情</h1>
    </div>

    <LoadingSpinner v-if="couponStore.loading" text="載入中..." />

    <div v-else-if="coupon" class="coupon-card">
      <div class="title-row">
        <h2 class="coupon-title">{{ coupon.name }}</h2>
      </div>

      <div class="coupon-code">代碼：{{ coupon.code }}</div>

      <div class="coupon-discount">{{ coupon.discount_display }}</div>

      <p class="coupon-desc">{{ coupon.description || '—' }}</p>

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
          <div class="label">開始時間</div>
          <div class="value">{{ coupon.start_at || '—' }}</div>
        </div>
        <div class="info-item">
          <div class="label">結束時間</div>
          <div class="value">{{ coupon.end_at || '—' }}</div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      {{ couponStore.error || '找不到該優惠券' }}
    </div>
  </div>
</template>

<script setup>
/**
 * 後台：我的優惠券詳情頁
 * - 使用與前台相同的優惠券詳情 API（/coupons/:id）
 * - 但不共用前台頁面（避免跳轉到前台 layout）
 */

import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCouponStore } from '@/store/coupon.store'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const couponStore = useCouponStore()

const couponId = route.params.id

const coupon = computed(() => couponStore.currentCoupon)

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
.my-coupon-detail-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
}

.btn-back {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 900;
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.3);
  background: white;
  transition: all 0.3s;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.coupon-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 28px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.coupon-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #2c3e50;
  line-height: 1.25;
}

.coupon-code {
  color: #7f8c8d;
  font-weight: 800;
  margin-bottom: 14px;
}

.coupon-discount {
  font-size: 2.1rem;
  font-weight: 900;
  color: #667eea;
  margin-bottom: 10px;
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
  font-weight: 900;
  color: #2c3e50;
  margin-bottom: 6px;
}

.value {
  color: #2c3e50;
  font-weight: 800;
}

.error {
  padding: 16px;
  border-radius: 12px;
  background: rgba(231, 76, 60, 0.08);
  border: 2px solid rgba(231, 76, 60, 0.25);
  color: #c0392b;
  font-weight: 900;
}
</style>
