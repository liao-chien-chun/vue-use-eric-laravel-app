/**
 * 文章狀態管理
 * 管理文章列表、我的文章等狀態
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postAPI } from '@/api/post.api'
import { formatErrorMessage } from '@/utils/error'

export const usePostStore = defineStore('post', () => {
  // ========== State ==========

  /**
   * 文章列表
   */
  const posts = ref([])

  /**
   * 我的文章列表
   */
  const myPosts = ref([])

  /**
   * 分頁資訊
   */
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  })

  /**
   * 當前文章
   */
  const currentPost = ref(null)

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
   * 獲取文章總數
   */
  const totalPosts = computed(() => posts.value.length)

  /**
   * 獲取我的文章總數
   */
  const myPostsCount = computed(() => myPosts.value.length)

  // ========== Actions ==========

  /**
   * 獲取所有文章
   * @param {Object} params - 查詢參數
   * @returns {Promise<boolean>}
   */
  async function fetchPosts(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await postAPI.getAll(params)
      // 後端格式: response.data.posts 或 response.data.data（分頁）
      const postsData = response.data?.data || response.data?.posts || response.data || response
      posts.value = Array.isArray(postsData) ? postsData : []

      // 更新分頁資訊（如果有的話）
      if (response.data?.pagination) {
        pagination.value = response.data.pagination
      } else if (response.data?.current_page) {
        // Laravel 標準分頁格式
        pagination.value = {
          current_page: response.data.current_page,
          per_page: response.data.per_page,
          total: response.data.total,
          last_page: response.data.last_page
        }
      }

      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取文章列表失敗')
      console.error('❌ 獲取文章失敗:', err)
      posts.value = []
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取使用者的文章
   * @param {number} userId - 使用者 ID
   * @param {Object} params - 查詢參數 (status, per_page, page)
   * @returns {Promise<boolean>}
   */
  async function fetchUserPosts(userId, params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await postAPI.getUserPosts(userId, params)
      // 後端格式: { data: { posts: [...], pagination: {...} } }
      // 確保 myPosts 永遠是陣列
      const posts = response.data?.posts || response.data || response
      myPosts.value = Array.isArray(posts) ? posts : []

      // 更新分頁資訊
      if (response.data?.pagination) {
        pagination.value = response.data.pagination
      }

      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取使用者文章失敗')
      console.error('❌ 獲取使用者文章失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取單一文章
   * @param {number} postId - 文章 ID
   * @returns {Promise<boolean>}
   */
  async function fetchPost(postId) {
    loading.value = true
    error.value = null

    try {
      const response = await postAPI.getById(postId)
      currentPost.value = response.data || response
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取文章詳情失敗')
      console.error('❌ 獲取文章詳情失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取當前用戶的單筆文章（用於編輯）
   * @param {number} postId - 文章 ID
   * @returns {Promise<boolean>}
   */
  async function fetchMyPost(postId) {
    loading.value = true
    error.value = null

    try {
      const response = await postAPI.getMyPost(postId)
      currentPost.value = response.data || response
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '獲取文章失敗')
      console.error('❌ 獲取我的文章失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增文章
   * @param {Object} postData - 文章資料
   * @returns {Promise<boolean>}
   */
  async function createPost(postData) {
    loading.value = true
    error.value = null

    try {
      const response = await postAPI.create(postData)
      // 新增成功後，加入到列表前面
      if (response.data) {
        // 確保 myPosts 是陣列才能 unshift
        if (!Array.isArray(myPosts.value)) {
          myPosts.value = []
        }
        myPosts.value.unshift(response.data)
      }
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '新增文章失敗')
      console.error('❌ 新增文章失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新文章
   * @param {number} postId - 文章 ID
   * @param {Object} postData - 文章資料
   * @returns {Promise<boolean>}
   */
  async function updatePost(postId, postData) {
    loading.value = true
    error.value = null

    try {
      const response = await postAPI.update(postId, postData)
      // 更新成功後，更新列表中的文章
      if (Array.isArray(myPosts.value)) {
        const index = myPosts.value.findIndex(p => p.id === postId)
        if (index !== -1 && response.data) {
          myPosts.value[index] = response.data
        }
      }
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '更新文章失敗')
      console.error('❌ 更新文章失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 刪除文章
   * @param {number} postId - 文章 ID
   * @returns {Promise<boolean>}
   */
  async function deletePost(postId) {
    loading.value = true
    error.value = null

    try {
      await postAPI.delete(postId)
      // 刪除成功後，從列表中移除
      if (Array.isArray(myPosts.value)) {
        myPosts.value = myPosts.value.filter(p => p.id !== postId)
      }
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '刪除文章失敗')
      console.error('❌ 刪除文章失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新文章狀態
   * @param {number} postId - 文章 ID
   * @param {string} status - 狀態
   * @returns {Promise<boolean>}
   */
  async function updatePostStatus(postId, status) {
    loading.value = true
    error.value = null

    try {
      await postAPI.updateStatus(postId, status)
      // 更新成功後，更新列表中的文章狀態
      if (Array.isArray(myPosts.value)) {
        const index = myPosts.value.findIndex(p => p.id === postId)
        if (index !== -1) {
          myPosts.value[index].status = status
        }
      }
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '更新文章狀態失敗')
      console.error('❌ 更新文章狀態失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置 Store
   */
  function reset() {
    posts.value = []
    myPosts.value = []
    currentPost.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    posts,
    myPosts,
    currentPost,
    pagination,
    loading,
    error,

    // Getters
    totalPosts,
    myPostsCount,

    // Actions
    fetchPosts,
    fetchUserPosts,
    fetchPost,
    fetchMyPost,
    createPost,
    updatePost,
    deletePost,
    updatePostStatus,
    reset,
  }
})

export default usePostStore
