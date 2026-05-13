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

  /**
   * 取得我的優惠券（已領取）
   * GET /coupons/my?per_page=15&page=1&status=2
   * status: 1=未使用, 2=已使用
   */
  getMyCoupons(params = {}, config = {}) {
    return http.get('/coupons/my', { params, ...config })
  },

  /**
   * 領取優惠券
   * POST /coupons/:id/claim
   */
  claim(id, config = {}) {
    return http.post(`/coupons/${id}/claim`, {}, { ...config })
  },
}

export default couponAPI
