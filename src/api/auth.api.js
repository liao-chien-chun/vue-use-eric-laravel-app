/**
 * 認證相關 API
 * 處理登入、登出、註冊等認證功能
 */

import http from '@/utils/http'

export const authAPI = {
  /**
   * 使用者登入
   * @param {Object} credentials - 登入憑證
   * @param {string} credentials.email - 電子郵件
   * @param {string} credentials.password - 密碼
   * @returns {Promise} 返回用戶資料和 token
   */
  login(credentials) {
    return http.post('/user/login', credentials)
  },

  /**
   * 使用者註冊
   * @param {Object} userData - 註冊資料
   * @param {string} userData.name - 姓名
   * @param {string} userData.email - 電子郵件
   * @param {string} userData.password - 密碼
   * @param {string} userData.password_confirmation - 確認密碼
   * @returns {Promise} 返回註冊結果
   */
  register(userData) {
    return http.post('/user/register', userData)
  },

  /**
   * 使用者登出
   * @returns {Promise}
   */
  logout() {
    return http.post('/user/logout')
  },

  /**
   * 獲取當前使用者資料（如果後端有提供的話）
   * @returns {Promise} 返回用戶資料
   */
  me() {
    return http.get('/user/me')
  },

  /**
   * 刷新 token（如果後端有提供的話）
   * @returns {Promise} 返回新的 token
   */
  refresh() {
    return http.post('/user/refresh')
  },

  /**
   * 忘記密碼 - 發送重置郵件
   * @param {string} email - 電子郵件
   * @returns {Promise}
   */
  forgotPassword(email) {
    return http.post('/auth/forgot-password', { email })
  },

  /**
   * 重置密碼
   * @param {Object} data - 重置密碼資料
   * @param {string} data.token - 重置 token
   * @param {string} data.email - 電子郵件
   * @param {string} data.password - 新密碼
   * @param {string} data.password_confirmation - 確認新密碼
   * @returns {Promise}
   */
  resetPassword(data) {
    return http.post('/auth/reset-password', data)
  },
}

export default authAPI
