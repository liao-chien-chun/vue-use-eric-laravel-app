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
  }

  return {
    coupons,
    currentCoupon,
    pagination,
    loading,
    error,
    totalCoupons,

    fetchCoupons,
    fetchCoupon,
    reset,
  }
})

export default useCouponStore
