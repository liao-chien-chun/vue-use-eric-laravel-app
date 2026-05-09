/**
 * 短網址相關 API
 * 處理短網址的建立、查詢、刪除等操作
 */

import http from '@/utils/http'

export const shortUrlAPI = {
  /**
   * 獲取我的短網址列表
   * @param {Object} params - 查詢參數
   * @returns {Promise}
   */
  getAll(params = {}) {
    return http.get('/short-urls', { params })
  },

  /**
   * 建立短網址
   * @param {Object} data - 短網址資料
   * @param {string} data.original_url - 原始網址
   * @param {string} data.short_code - 自訂短碼（可選）
   * @param {string} data.expired_at - 過期時間（可選，格式: YYYY-MM-DD HH:MM:SS）
   * @returns {Promise}
   */
  create(data) {
    return http.post('/short-urls', data)
  },

  /**
   * 刪除短網址
   * @param {number} id - 短網址 ID
   * @returns {Promise}
   */
  delete(id) {
    return http.delete(`/short-urls/${id}`)
  },
}

export default shortUrlAPI
