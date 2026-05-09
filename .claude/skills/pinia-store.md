# Pinia Store Generator

建立新的 Pinia Store，使用 Composition API 風格。

## 使用方式

當用戶需要添加新的狀態管理時使用此 skill。

## 步驟

1. 詢問用戶：
   - Store 名稱（例如：product, cart, notification）
   - 需要管理哪些狀態
   - 需要哪些操作方法

2. 在 `src/store/` 建立新的 store 檔案

3. Store 應包含：
   - 使用 Composition API 風格（setup 函數）
   - State（使用 ref 或 reactive）
   - Getters（使用 computed）
   - Actions（異步或同步方法）
   - 完整的中文註解

## 範例

```javascript
/**
 * 產品狀態管理
 * 管理產品列表、選中產品等狀態
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productAPI } from '@/api/product.api'

export const useProductStore = defineStore('product', () => {
  // ========== State ==========

  /**
   * 產品列表
   */
  const products = ref([])

  /**
   * 選中的產品
   */
  const selectedProduct = ref(null)

  /**
   * 載入狀態
   */
  const loading = ref(false)

  /**
   * 錯誤訊息
   */
  const error = ref(null)

  // ========== Getters ==========

  /**
   * 獲取產品總數
   */
  const totalProducts = computed(() => {
    return products.value.length
  })

  /**
   * 獲取精選產品
   */
  const featuredProducts = computed(() => {
    return products.value.filter(p => p.is_featured)
  })

  /**
   * 檢查是否有選中產品
   */
  const hasSelectedProduct = computed(() => {
    return !!selectedProduct.value
  })

  // ========== Actions ==========

  /**
   * 獲取所有產品
   * @param {Object} params - 查詢參數
   * @returns {Promise<boolean>} 是否成功
   */
  async function fetchProducts(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await productAPI.getAll(params)
      products.value = response.data || response
      return true
    } catch (err) {
      error.value = err.message || '獲取產品列表失敗'
      console.error('❌ 獲取產品失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 選擇產品
   * @param {number} productId - 產品 ID
   * @returns {Promise<boolean>} 是否成功
   */
  async function selectProduct(productId) {
    loading.value = true
    error.value = null

    try {
      const response = await productAPI.getById(productId)
      selectedProduct.value = response.data || response
      return true
    } catch (err) {
      error.value = err.message || '獲取產品詳情失敗'
      console.error('❌ 獲取產品詳情失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除選中的產品
   */
  function clearSelectedProduct() {
    selectedProduct.value = null
  }

  /**
   * 重置 Store
   */
  function reset() {
    products.value = []
    selectedProduct.value = null
    loading.value = false
    error.value = null
  }

  // 返回所有 state、getters 和 actions
  return {
    // State
    products,
    selectedProduct,
    loading,
    error,

    // Getters
    totalProducts,
    featuredProducts,
    hasSelectedProduct,

    // Actions
    fetchProducts,
    selectProduct,
    clearSelectedProduct,
    reset,
  }
})

export default useProductStore
```

## 注意事項

- 使用 Composition API 風格（setup 函數）
- State 使用 `ref()` 或 `reactive()`
- Getters 使用 `computed()`
- Actions 使用普通函數
- 所有註解使用中文
- 使用 JSDoc 標註參數和返回值
- 記得處理 loading 和 error 狀態
