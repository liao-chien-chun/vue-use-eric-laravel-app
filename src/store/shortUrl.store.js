/**
 * 短網址狀態管理
 * 管理短網址列表、新增、刪除等狀態
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { shortUrlAPI } from '@/api/shortUrl.api'
import { formatErrorMessage } from '@/utils/error'

export const useShortUrlStore = defineStore('shortUrl', () => {
  // ========== State ==========

  /**
   * 短網址列表
   */
  const shortUrls = ref([])

  /**
   * 載入狀態
   */
  const loading = ref(false)

  /**
   * 錯誤訊息
   */
  const error = ref(null)

  // ========== Actions ==========

  /**
   * 獲取我的短網址列表
   * @param {Object} params - 查詢參數
   * @returns {Promise<boolean>}
   */
  async function fetchShortUrls(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await shortUrlAPI.getAll(params)
      // 後端格式: { data: { items: [...], pagination: {...} } }
      // 確保 shortUrls 永遠是陣列
      const urls = response.data?.items || response.data || response
      shortUrls.value = Array.isArray(urls) ? urls : []

      console.log('✅ 短網址列表載入成功，共', shortUrls.value.length, '筆')
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取短網址列表失敗')
      console.error('❌ 獲取短網址失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 建立短網址
   * @param {Object} data - 短網址資料
   * @returns {Promise<boolean>}
   */
  async function createShortUrl(data) {
    loading.value = true
    error.value = null

    try {
      const response = await shortUrlAPI.create(data)
      if (response.data) {
        // 確保 shortUrls 是陣列才能 unshift
        if (!Array.isArray(shortUrls.value)) {
          shortUrls.value = []
        }
        shortUrls.value.unshift(response.data)
      }
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '建立短網址失敗')
      console.error('❌ 建立短網址失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 刪除短網址
   * @param {number} id - 短網址 ID
   * @returns {Promise<boolean>}
   */
  async function deleteShortUrl(id) {
    loading.value = true
    error.value = null

    try {
      await shortUrlAPI.delete(id)
      // 刪除成功後，從列表中移除
      if (Array.isArray(shortUrls.value)) {
        shortUrls.value = shortUrls.value.filter(url => url.id !== id)
      }
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '刪除短網址失敗')
      console.error('❌ 刪除短網址失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置 Store
   */
  function reset() {
    shortUrls.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    shortUrls,
    loading,
    error,

    // Actions
    fetchShortUrls,
    createShortUrl,
    deleteShortUrl,
    reset,
  }
})

export default useShortUrlStore
