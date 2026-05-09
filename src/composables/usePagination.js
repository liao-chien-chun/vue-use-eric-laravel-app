/**
 * 分頁功能 Composable
 * 提供分頁相關的狀態和方法
 */

import { ref, computed } from 'vue'
import { PAGINATION } from '@/constants'

/**
 * 使用分頁功能
 * @param {Object} options - 分頁選項
 * @param {number} options.initialPage - 初始頁碼
 * @param {number} options.initialPerPage - 初始每頁筆數
 * @returns {Object} 分頁相關的狀態和方法
 */
export function usePagination(options = {}) {
  const {
    initialPage = PAGINATION.DEFAULT_PAGE,
    initialPerPage = PAGINATION.DEFAULT_PER_PAGE,
  } = options

  // 當前頁碼
  const currentPage = ref(initialPage)

  // 每頁筆數
  const perPage = ref(initialPerPage)

  // 總筆數
  const total = ref(0)

  // 計算總頁數
  const totalPages = computed(() => {
    return Math.ceil(total.value / perPage.value)
  })

  // 計算起始索引
  const startIndex = computed(() => {
    return (currentPage.value - 1) * perPage.value
  })

  // 計算結束索引
  const endIndex = computed(() => {
    return Math.min(startIndex.value + perPage.value, total.value)
  })

  // 是否有上一頁
  const hasPrevPage = computed(() => {
    return currentPage.value > 1
  })

  // 是否有下一頁
  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  /**
   * 前往指定頁碼
   * @param {number} page - 頁碼
   */
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  /**
   * 前往上一頁
   */
  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }

  /**
   * 前往下一頁
   */
  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  /**
   * 前往第一頁
   */
  const firstPage = () => {
    currentPage.value = 1
  }

  /**
   * 前往最後一頁
   */
  const lastPage = () => {
    currentPage.value = totalPages.value
  }

  /**
   * 改變每頁筆數
   * @param {number} newPerPage - 新的每頁筆數
   */
  const changePerPage = (newPerPage) => {
    perPage.value = newPerPage
    currentPage.value = 1 // 重置到第一頁
  }

  /**
   * 設置總筆數
   * @param {number} newTotal - 新的總筆數
   */
  const setTotal = (newTotal) => {
    total.value = newTotal
  }

  /**
   * 重置分頁
   */
  const reset = () => {
    currentPage.value = initialPage
    perPage.value = initialPerPage
    total.value = 0
  }

  return {
    // State
    currentPage,
    perPage,
    total,

    // Computed
    totalPages,
    startIndex,
    endIndex,
    hasPrevPage,
    hasNextPage,

    // Methods
    goToPage,
    prevPage,
    nextPage,
    firstPage,
    lastPage,
    changePerPage,
    setTotal,
    reset,
  }
}

export default usePagination
