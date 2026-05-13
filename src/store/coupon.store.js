/**
 * 優惠券狀態管理
 * 管理優惠券列表與單筆詳情
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { couponAPI } from '@/api/coupon.api'
import { useAuthStore } from '@/store/auth.store'
import { formatErrorMessage } from '@/utils/error'

export const useCouponStore = defineStore('coupon', () => {
  const coupons = ref([])
  const currentCoupon = ref(null)

  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  })

  const loading = ref(false)
  const error = ref(null)

  // 領取動作狀態（避免影響列表 loading）
  const claimingCouponId = ref(null)
  const claimError = ref(null)

  const totalCoupons = computed(() => coupons.value.length)

  async function fetchCoupons(params = {}) {
    loading.value = true
    error.value = null

    const authStore = useAuthStore()

    try {
      const response = await couponAPI.getAll(params, {
        skipAuth: !authStore.isAuthenticated,
      })

      const items = response?.data?.items || response?.data || response?.items || []
      coupons.value = Array.isArray(items) ? items : []

      const paging = response?.data?.pagination || response?.pagination
      if (paging && typeof paging === 'object') {
        pagination.value = paging
      }

      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取優惠券列表失敗')
      console.error('❌ 獲取優惠券列表失敗:', err)
      coupons.value = []
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCoupon(couponId) {
    loading.value = true
    error.value = null

    const authStore = useAuthStore()

    try {
      const response = await couponAPI.getById(couponId, {
        skipAuth: !authStore.isAuthenticated,
      })
      currentCoupon.value = response?.data || response
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取優惠券詳情失敗')
      console.error('❌ 獲取優惠券詳情失敗:', err)
      currentCoupon.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 領取優惠券
   * 成功後會同步更新本地 coupons/currentCoupon 的狀態
   */
  async function claimCoupon(couponId) {
    claimError.value = null
    claimingCouponId.value = couponId

    try {
      const response = await couponAPI.claim(couponId)

      // 本地同步：將該券標記為已領取，並關閉可領取
      const listItem = Array.isArray(coupons.value)
        ? coupons.value.find(c => String(c.id) === String(couponId))
        : null

      if (listItem) {
        listItem.is_claimed = true
        listItem.can_claim = false

        if (typeof listItem.remaining_quantity === 'number' && listItem.remaining_quantity > 0) {
          listItem.remaining_quantity -= 1
        }
      }

      if (currentCoupon.value && String(currentCoupon.value.id) === String(couponId)) {
        currentCoupon.value.is_claimed = true
        currentCoupon.value.can_claim = false

        if (typeof currentCoupon.value.remaining_quantity === 'number' && currentCoupon.value.remaining_quantity > 0) {
          currentCoupon.value.remaining_quantity -= 1
        }
      }

      return {
        success: true,
        message: response?.message || '優惠券領取成功',
        data: response?.data || null,
      }
    } catch (err) {
      const message = formatErrorMessage(err, '優惠券領取失敗')
      claimError.value = message
      console.error('❌ 優惠券領取失敗:', err)
      return { success: false, message }
    } finally {
      claimingCouponId.value = null
    }
  }

  function reset() {
    coupons.value = []
    currentCoupon.value = null
    pagination.value = {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    }
    loading.value = false
    error.value = null

    claimingCouponId.value = null
    claimError.value = null
  }

  return {
    coupons,
    currentCoupon,
    pagination,
    loading,
    error,
    totalCoupons,

    claimingCouponId,
    claimError,

    fetchCoupons,
    fetchCoupon,
    claimCoupon,
    reset,
  }
})

export default useCouponStore
