/**
 * 基礎 API 類別
 * 提供通用的 CRUD 操作方法
 * 其他 API 服務可以繼承此類別
 */

import http from '@/utils/http'

export class BaseAPI {
  /**
   * 建構子
   * @param {string} resource - API 資源路徑，例如 'users', 'posts'
   */
  constructor(resource) {
    this.resource = resource
  }

  /**
   * 獲取所有資源列表
   * @param {Object} params - 查詢參數（分頁、篩選等）
   * @returns {Promise}
   */
  getAll(params = {}) {
    return http.get(`/${this.resource}`, { params })
  }

  /**
   * 根據 ID 獲取單一資源
   * @param {number|string} id - 資源 ID
   * @returns {Promise}
   */
  getById(id) {
    return http.get(`/${this.resource}/${id}`)
  }

  /**
   * 創建新資源
   * @param {Object} data - 資源數據
   * @returns {Promise}
   */
  create(data) {
    return http.post(`/${this.resource}`, data)
  }

  /**
   * 更新資源
   * @param {number|string} id - 資源 ID
   * @param {Object} data - 更新的數據
   * @returns {Promise}
   */
  update(id, data) {
    return http.put(`/${this.resource}/${id}`, data)
  }

  /**
   * 部分更新資源
   * @param {number|string} id - 資源 ID
   * @param {Object} data - 更新的數據
   * @returns {Promise}
   */
  patch(id, data) {
    return http.patch(`/${this.resource}/${id}`, data)
  }

  /**
   * 刪除資源
   * @param {number|string} id - 資源 ID
   * @returns {Promise}
   */
  delete(id) {
    return http.delete(`/${this.resource}/${id}`)
  }
}

export default BaseAPI
