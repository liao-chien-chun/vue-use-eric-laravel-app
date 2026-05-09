/**
 * 文章相關 API
 * 處理文章的 CRUD 操作、留言等功能
 */

import { BaseAPI } from './base.api'
import http from '@/utils/http'

class PostAPI extends BaseAPI {
  constructor() {
    // 調用父類建構子，設定資源路徑
    super('posts')
  }

  /**
   * 獲取使用者的文章列表
   * @param {number|string} userId - 使用者 ID
   * @param {Object} params - 查詢參數
   * @returns {Promise}
   */
  getUserPosts(userId, params = {}) {
    return http.get(`/user/${userId}/posts`, { params })
  }

  /**
   * 獲取當前用戶的單筆文章
   * @param {number|string} postId - 文章 ID
   * @returns {Promise}
   */
  getMyPost(postId) {
    return http.get(`/me/posts/${postId}`)
  }

  /**
   * 更新文章狀態
   * @param {number} postId - 文章 ID
   * @param {string} status - 狀態（published, draft, hidden）
   * @returns {Promise}
   */
  updateStatus(postId, status) {
    return http.patch(`/${this.resource}/${postId}/status`, { status })
  }

  /**
   * 獲取文章的留言列表
   * @param {number} postId - 文章 ID
   * @returns {Promise}
   */
  getComments(postId) {
    return http.get(`/${this.resource}/${postId}/comments`)
  }

  /**
   * 新增留言到文章
   * @param {number} postId - 文章 ID
   * @param {Object} commentData - 留言資料
   * @returns {Promise}
   */
  addComment(postId, commentData) {
    return http.post(`/${this.resource}/${postId}/comments`, commentData)
  }

  /**
   * 修改留言
   * @param {number} postId - 文章 ID
   * @param {number} commentId - 留言 ID
   * @param {Object} commentData - 留言資料
   * @returns {Promise}
   */
  updateComment(postId, commentId, commentData) {
    return http.patch(`/${this.resource}/${postId}/comments/${commentId}`, commentData)
  }

  /**
   * 刪除留言
   * @param {number} postId - 文章 ID
   * @param {number} commentId - 留言 ID
   * @returns {Promise}
   */
  deleteComment(postId, commentId) {
    return http.delete(`/${this.resource}/${postId}/comments/${commentId}`)
  }
}

// 導出單例實例
export const postAPI = new PostAPI()
export default postAPI
