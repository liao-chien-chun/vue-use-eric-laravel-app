# API Service Generator

建立新的 API 服務模組，遵循專案的 API 層架構。

## 使用方式

當用戶需要添加新的 API 端點時使用此 skill。

## 步驟

1. 詢問用戶：
   - API 資源名稱（例如：products, orders）
   - 是否需要繼承 BaseAPI
   - 需要哪些自定義方法

2. 在 `src/api/` 建立新的 API 檔案

3. 檔案應包含：
   - 繼承自 BaseAPI（如適用）
   - 完整的中文註解
   - JSDoc 風格的參數說明
   - 清楚的方法說明

## 範例

### 繼承 BaseAPI

```javascript
/**
 * 產品相關 API
 * 處理產品的 CRUD 操作
 */

import { BaseAPI } from './base.api'
import http from '@/utils/http'

class ProductAPI extends BaseAPI {
  constructor() {
    // 調用父類建構子，設定資源路徑
    super('products')
  }

  /**
   * 獲取精選產品
   * @returns {Promise} 精選產品列表
   */
  async getFeatured() {
    return http.get(`/${this.resource}/featured`)
  }

  /**
   * 搜尋產品
   * @param {string} keyword - 搜尋關鍵字
   * @param {Object} filters - 篩選條件
   * @returns {Promise} 搜尋結果
   */
  async search(keyword, filters = {}) {
    return http.get(`/${this.resource}/search`, {
      params: { keyword, ...filters }
    })
  }
}

// 導出單例實例
export const productAPI = new ProductAPI()
export default productAPI
```

### 獨立 API（不繼承 BaseAPI）

```javascript
/**
 * 統計相關 API
 */

import http from '@/utils/http'

export const statsAPI = {
  /**
   * 獲取儀表板統計數據
   * @returns {Promise} 統計數據
   */
  getDashboardStats() {
    return http.get('/stats/dashboard')
  },

  /**
   * 獲取指定期間的統計
   * @param {string} startDate - 開始日期
   * @param {string} endDate - 結束日期
   * @returns {Promise} 統計數據
   */
  getStatsByDateRange(startDate, endDate) {
    return http.get('/stats/range', {
      params: { start_date: startDate, end_date: endDate }
    })
  },
}

export default statsAPI
```

## 注意事項

- 所有註解使用中文
- 使用 JSDoc 風格標註參數和返回值
- 如果需要 CRUD 操作，優先繼承 BaseAPI
- 導出單例實例而非類別
