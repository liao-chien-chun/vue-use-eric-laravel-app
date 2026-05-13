/**
 * 我的優惠券狀態管理
 * 顯示使用者已領取的優惠券（依使用狀態篩選）
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { couponAPI } from '@/api/coupon.api'
import { formatErrorMessage } from '@/utils/error'

export const useMyCouponStore = defineStore('myCoupon', () => {
  const myCoupons = ref([])

  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  })

  const loading = ref(false)
  const error = ref(null)

  async function fetchMyCoupons(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await couponAPI.getMyCoupons(params)
      const items = response?.data?.items || response?.data || response?.items || []
      myCoupons.value = Array.isArray(items) ? items : []

      const paging = response?.data?.pagination || response?.pagination
      if (paging && typeof paging === 'object') {
        pagination.value = paging
      }

      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取我的優惠券失敗')
      console.error('❌ 獲取我的優惠券失敗:', err)
      myCoupons.value = []
      return false
    } finally {
      loading.value = false
    }
  }

  function reset() {
    myCoupons.value = []
    pagination.value = {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
    }
    loading.value = false
    error.value = null
  }

  return {
    myCoupons,
    pagination,
    loading,
    error,

    fetchMyCoupons,
    reset,
  }
})

export default useMyCouponStore
