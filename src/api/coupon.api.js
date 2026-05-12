/**
 * 優惠券相關 API
 * 取得可用優惠券列表、單一優惠券詳情
 */

import http from '@/utils/http'

export const couponAPI = {
  /**
   * 取得優惠券列表
   * GET /coupons?per_page=15&page=1
   */
  getAll(params = {}, config = {}) {
    return http.get('/coupons', { params, ...config })
  },

  /**
   * 取得優惠券詳情
   * GET /coupons/:id
   */
  getById(id, config = {}) {
    return http.get(`/coupons/${id}`, { ...config })
  },
}

export default couponAPI
