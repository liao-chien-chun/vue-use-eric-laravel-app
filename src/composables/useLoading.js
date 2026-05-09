/**
 * Loading 狀態管理 Composable
 * 用於管理異步操作的載入狀態
 */

import { ref } from 'vue'

/**
 * 使用 Loading 狀態
 * @param {boolean} initialState - 初始載入狀態
 * @returns {Object} Loading 相關的狀態和方法
 */
export function useLoading(initialState = false) {
  // 載入狀態
  const loading = ref(initialState)

  /**
   * 開始載入
   */
  const startLoading = () => {
    loading.value = true
  }

  /**
   * 停止載入
   */
  const stopLoading = () => {
    loading.value = false
  }

  /**
   * 切換載入狀態
   */
  const toggleLoading = () => {
    loading.value = !loading.value
  }

  /**
   * 包裝異步函數，自動管理載入狀態
   * @param {Function} asyncFn - 異步函數
   * @returns {Promise} 異步函數的執行結果
   */
  const withLoading = async (asyncFn) => {
    startLoading()
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }

  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  }
}

export default useLoading
