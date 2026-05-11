/**
 * 認證狀態管理
 * 使用 Pinia 管理用戶認證狀態、登入登出等操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth.api'
import { formatErrorMessage } from '@/utils/error'

export const useAuthStore = defineStore('auth', () => {
  // ========== State ==========

  /**
   * 當前使用者資料
   * 從 localStorage 讀取已儲存的使用者資料
   */
  const savedUser = localStorage.getItem('user')
  const user = ref(null)

  try {
    user.value = savedUser ? JSON.parse(savedUser) : null
  } catch (err) {
    localStorage.removeItem('user')
  }

  /**
   * 認證 token
   */
  const token = ref(localStorage.getItem('token') || null)

  /**
   * 載入狀態
   */
  const loading = ref(false)

  /**
   * 錯誤訊息
   */
  const error = ref(null)

  /**
   * 是否正在驗證 token
   */
  const isValidating = ref(false)
  const validationPromise = ref(null)

  // ========== Getters ==========

  /**
   * 檢查使用者是否已登入
   */
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  /**
   * 獲取使用者名稱
   */
  const userName = computed(() => {
    return user.value?.name || '訪客'
  })

  /**
   * 獲取使用者 Email
   */
  const userEmail = computed(() => {
    return user.value?.email || ''
  })

  /**
   * 檢查使用者是否為管理者
   * role.id = 1 或 role.name = 'admin' 都算管理者
   */
  const isAdmin = computed(() => {
    if (!user.value || !user.value.role) return false
    return user.value.role.name === 'admin' || user.value.role.id === 1
  })

  /**
   * 獲取使用者角色名稱
   */
  const userRole = computed(() => {
    return user.value?.role?.display_name || user.value?.role?.name || '訪客'
  })

  // ========== Actions ==========

  /**
   * 登入
   * @param {Object} credentials - 登入憑證
   * @param {string} credentials.email - 電子郵件
   * @param {string} credentials.password - 密碼
   * @returns {Promise<boolean>} 登入是否成功
   */
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      // 調用登入 API
      const response = await authAPI.login(credentials)

      // 儲存 token 和使用者資料
      // Laravel 後端回傳格式: { success, status, message, data: { access_token, user } }
      token.value = response.data.access_token
      user.value = response.data.user

      // 持久化 token 和 user 到 localStorage
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      console.log('✅ 登入成功:', user.value.name)
      return true
    } catch (err) {
      // 處理登入錯誤
      error.value = formatErrorMessage(err, '登入失敗')
      console.error('❌ 登入失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 註冊
   * @param {Object} userData - 註冊資料
   * @returns {Promise<boolean>} 註冊是否成功
   */
  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.register(userData)

      // 註冊成功，但不自動登入
      // 讓使用者手動到登入頁面登入
      console.log('✅ 註冊成功')
      return true
    } catch (err) {
      error.value = formatErrorMessage(err, '註冊失敗')
      console.error('❌ 註冊失敗:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除本地認證狀態
   * 用於 token 過期、401 或登出後清理，不呼叫 API。
   */
  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * 登出
   */
  async function logout() {
    loading.value = true

    try {
      // 調用登出 API（可選，看後端是否需要）
      await authAPI.logout()
    } catch (err) {
      console.error('⚠️ 登出 API 調用失敗:', err)
    } finally {
      // 清除本地狀態
      clearAuth()
      loading.value = false

      console.log('👋 已登出')
    }
  }

  /**
   * 獲取當前使用者資料
   * @returns {Promise<boolean>} 是否成功獲取
   */
  async function fetchUser() {
    if (!token.value) {
      clearAuth()
      return false
    }

    if (validationPromise.value) {
      return await validationPromise.value
    }

    loading.value = true
    isValidating.value = true
    error.value = null

    validationPromise.value = (async () => {
      try {
        const response = await authAPI.me()
        user.value = response.data?.user || response.data || response.user || response
        localStorage.setItem('user', JSON.stringify(user.value))

        console.log('✅ 獲取使用者資料成功')
        return true
      } catch (err) {
        // 如果 token 無效，清除認證資料
        error.value = formatErrorMessage(err, '獲取使用者資料失敗')
        console.error('❌ 獲取使用者資料失敗:', err)

        if (err.status === 401) {
          // token 過期或無效
          clearAuth()
        }

        return false
      } finally {
        loading.value = false
        isValidating.value = false
        validationPromise.value = null
      }
    })()

    return await validationPromise.value
  }

  /**
   * 驗證目前登入狀態
   * 有本地 token 時會向後端確認 token 是否仍有效。
   */
  async function validateAuth() {
    if (!token.value) {
      clearAuth()
      return false
    }

    return await fetchUser()
  }

  /**
   * 初始化認證狀態
   * 應用啟動時調用，清除不完整的本地登入狀態。
   * token 有效性由路由守衛在進入需登入頁面時向後端確認。
   */
  async function initAuth() {
    if (!token.value) {
      clearAuth()
    }
  }

  // 返回 store 的 state、getters 和 actions
  return {
    // State
    user,
    token,
    loading,
    error,
    isValidating,

    // Getters
    isAuthenticated,
    userName,
    userEmail,
    isAdmin,
    userRole,

    // Actions
    login,
    register,
    logout,
    clearAuth,
    fetchUser,
    validateAuth,
    initAuth,
  }
})

export default useAuthStore
