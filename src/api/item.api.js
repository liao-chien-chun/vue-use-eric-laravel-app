/**
 * 商品相關 API
 * 處理商品的 CRUD 操作
 */

import { BaseAPI } from './base.api'

class ItemAPI extends BaseAPI {
  constructor() {
    // 調用父類建構子，設定資源路徑
    super('items')
  }

  // 可以在這裡添加商品特有的方法
}

// 導出單例實例
export const itemAPI = new ItemAPI()
export default itemAPI
