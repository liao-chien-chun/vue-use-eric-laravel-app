/**
 * 使用者相關 API
 * 繼承自 BaseAPI，提供使用者 CRUD 操作
 * 並可擴展額外的使用者相關方法
 */

import { BaseAPI } from './base.api'
import http from '@/utils/http'

class UserAPI extends BaseAPI {
  constructor() {
    // 調用父類建構子，設定資源路徑
    super('users')
  }

  /**
   * 獲取使用者個人檔案
   * @param {number} userId - 使用者 ID
   * @returns {Promise}
   */
  getProfile(userId) {
    return http.get(`/${this.resource}/${userId}/profile`)
  }

  /**
   * 更新使用者個人檔案
   * @param {number} userId - 使用者 ID
   * @param {Object} profileData - 個人檔案資料
   * @returns {Promise}
   */
  updateProfile(userId, profileData) {
    return http.put(`/${this.resource}/${userId}/profile`, profileData)
  }

  /**
   * 上傳使用者頭像
   * @param {number} userId - 使用者 ID
   * @param {FormData} formData - 包含圖片的 FormData
   * @returns {Promise}
   */
  uploadAvatar(userId, formData) {
    return http.post(`/${this.resource}/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 修改密碼
   * @param {number} userId - 使用者 ID
   * @param {Object} passwordData - 密碼資料
   * @param {string} passwordData.current_password - 當前密碼
   * @param {string} passwordData.new_password - 新密碼
   * @param {string} passwordData.new_password_confirmation - 確認新密碼
   * @returns {Promise}
   */
  changePassword(userId, passwordData) {
    return http.post(`/${this.resource}/${userId}/change-password`, passwordData)
  },
}

// 導出單例實例
export const userAPI = new UserAPI()
export default userAPI
