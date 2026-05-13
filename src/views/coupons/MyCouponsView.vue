<template>
  <div class="my-coupons-view">
    <div class="header">
      <h1>我的優惠券</h1>
    </div>

    <!-- 狀態篩選按鈕（參考我的文章） -->
    <div class="status-filters">
      <button
        :class="['filter-btn', { active: currentStatus === 1 }]"
        @click="changeStatus(1)"
      >
        未使用
      </button>
      <button
        :class="['filter-btn', { active: currentStatus === 2 }]"
        @click="changeStatus(2)"
      >
        已使用
      </button>
    </div>

    <!-- 每頁筆數選擇（10~50） -->
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
    <LoadingSpinner v-if="myCouponStore.loading" text="載入中..." />

    <!-- 錯誤訊息 -->
    <div v-else-if="myCouponStore.error" class="error">
      {{ myCouponStore.error }}
    </div>

    <!-- 列表 -->
    <div v-else-if="normalizedCoupons.length > 0" class="coupons-list">
      <div
        v-for="coupon in normalizedCoupons"
        :key="coupon._key"
        class="coupon-card"
        @click="goToCoupon(coupon.couponId)"
      >
        <div class="coupon-content">
          <h3 class="coupon-title">{{ coupon.name }}</h3>
          <div class="coupon-discount">{{ coupon.discountDisplay || '—' }}</div>
          <p class="coupon-desc">{{ coupon.description || '—' }}</p>

          <div class="coupon-meta">
            <span class="meta-item">低消：{{ formatMoney(coupon.minOrderAmount) }}</span>
            <span class="meta-item">到期：{{ coupon.endAt || '—' }}</span>
          </div>
        </div>

        <div class="coupon-actions">
          <button class="btn-action" type="button" @click.stop="goToCoupon(coupon.couponId)">
            查看
          </button>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <p v-if="currentStatus === 1">目前沒有未使用的優惠券</p>
      <p v-else>目前沒有已使用的優惠券</p>
    </div>

    <!-- 分頁（照舊） -->
    <div v-if="normalizedCoupons.length > 0 && pagination.last_page > 1" class="pagination">
      <button
        @click="changePage(1)"
        :disabled="currentPage === 1 || myCouponStore.loading"
        class="pagination-btn"
        title="第一頁"
      >
        第一頁
      </button>

      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1 || myCouponStore.loading"
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
          :disabled="myCouponStore.loading || page === '...'"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === pagination.last_page || myCouponStore.loading"
        class="pagination-btn"
      >
        下一頁
      </button>

      <button
        @click="changePage(pagination.last_page)"
        :disabled="currentPage === pagination.last_page || myCouponStore.loading"
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
</template>

<script setup>
/**
 * 我的優惠券列表（已領取）
 * status: 1=未使用, 2=已使用
 * 點擊可進入共用優惠券詳情頁 /coupons/:id
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyCouponStore } from '@/store/myCoupon.store'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const myCouponStore = useMyCouponStore()

const currentStatus = ref(1)
const currentPage = ref(1)
const perPage = ref(10)

const pagination = computed(() => myCouponStore.pagination)

const normalizedCoupons = computed(() => {
  const items = Array.isArray(myCouponStore.myCoupons) ? myCouponStore.myCoupons : []

  return items
    .map((item, index) => {
      // 後端常見格式：{ id: user_coupon_id, coupon: { id, ... } }
      // 也可能直接回 coupon 本體。這裡做容錯。
      const coupon = item?.coupon || item
      const couponId = coupon?.id ?? item?.coupon_id ?? item?.couponId ?? null

      return {
        _key: `${couponId ?? 'unknown'}-${index}`,
        couponId,
        code: coupon?.code ?? item?.code ?? '',
        name: coupon?.name ?? item?.name ?? '',
        description: coupon?.description ?? item?.description ?? '',
        discountDisplay: coupon?.discount_display ?? coupon?.discountDisplay ?? '',
        minOrderAmount: coupon?.min_order_amount ?? coupon?.minOrderAmount ?? null,
        endAt: coupon?.end_at ?? item?.end_at ?? null,
      }
    })
    .filter(c => c.couponId != null)
})

const fetchMyCoupons = async (status = 1, page = 1) => {
  await myCouponStore.fetchMyCoupons({
    status,
    per_page: perPage.value,
    page,
  })
}

const changeStatus = async (status) => {
  currentStatus.value = status
  currentPage.value = 1
  await fetchMyCoupons(status, 1)
}

const changePage = async (page) => {
  if (page < 1 || page > pagination.value.last_page || page === '...') return
  currentPage.value = page
  await fetchMyCoupons(currentStatus.value, page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const changePerPage = async (size) => {
  perPage.value = size
  currentPage.value = 1
  await fetchMyCoupons(currentStatus.value, 1)
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
  router.push(`/coupons/my/${couponId}`)
}

const formatMoney = (value) => {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return '—'
  return numberValue <= 0 ? '無' : `$${numberValue}`
}

onMounted(() => {
  fetchMyCoupons(currentStatus.value, currentPage.value)
})
</script>

<style scoped>
.my-coupons-view {
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

/* 狀態切換按鈕（參考我的文章） */
.status-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 18px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 800;
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

/* 每頁筆數 */
.per-page-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.per-page-label {
  font-weight: 800;
  color: #2c3e50;
}

.per-page-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.per-page-btn {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 800;
  color: #2c3e50;
}

.per-page-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.per-page-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.error {
  padding: 16px;
  border-radius: 12px;
  background: rgba(231, 76, 60, 0.08);
  border: 2px solid rgba(231, 76, 60, 0.25);
  color: #c0392b;
  font-weight: 800;
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: #fafbfc;
}

.coupon-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: #2c3e50;
  margin-bottom: 6px;
}

.coupon-discount {
  font-size: 1.4rem;
  font-weight: 900;
  color: #667eea;
  margin-bottom: 8px;
}

.coupon-desc {
  color: #2c3e50;
  opacity: 0.9;
  margin-bottom: 10px;
  line-height: 1.6;
}

.coupon-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: #7f8c8d;
  font-weight: 800;
}

.meta-item {
  background: #f5f6fa;
  padding: 6px 10px;
  border-radius: 10px;
}

.coupon-actions {
  display: flex;
  align-items: center;
}

.btn-action {
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 900;
  border: 2px solid #667eea;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-action:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #7f8c8d;
  font-weight: 800;
}

/* 分頁（照舊） */
.pagination {
  margin-top: 24px;
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
  font-weight: 800;
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
  font-weight: 900;
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
  font-weight: 800;
  margin-top: 10px;
}
</style>
