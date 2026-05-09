/**
 * 商品狀態管理
 * 管理商品列表、新增商品等狀態
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { itemAPI } from '@/api/item.api'
import { formatErrorMessage } from '@/utils/error'

export const useItemStore = defineStore('item', () => {
  // ========== State ==========

  /**
   * 商品列表
   */
  const items = ref([])

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
   * 獲取所有商品
   * @param {Object} params - 查詢參數 (status, per_page, page)
   * @returns {Promise<boolean>}
   */
  async function fetchItems(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await itemAPI.getAll(params)
      // 後端格式: response.data.items
      const itemsData = response.data?.items || response.data || response
      items.value = Array.isArray(itemsData) ? itemsData : []
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取商品列表失敗')
      console.error('❌ 獲取商品失敗:', err)
      items.value = [] // 發生錯誤時確保是空陣列
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增商品
   * @param {Object} itemData - 商品資料
   * @returns {Promise<boolean>}
   */
  async function createItem(itemData) {
    loading.value = true
    error.value = null

    try {
      await itemAPI.create(itemData)
      // 新增成功，不在這裡更新列表
      // 由呼叫方重新 fetchItems 來刷新列表
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '新增商品失敗')
      console.error('❌ 新增商品失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置 Store
   */
  function reset() {
    items.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    items,
    loading,
    error,

    // Actions
    fetchItems,
    createItem,
    reset,
  }
})

export default useItemStore
