/**
 * HTTP 請求工具
 * 基於 Axios 封裝的 HTTP 客戶端
 * 包含請求/響應攔截器、錯誤處理等
 */

import axios from 'axios'
import appConfig from '@/config/app.config'

let isRedirectingToLogin = false
let authProbePromise = null

const authProbeClient = axios.create({
  baseURL: appConfig.api.baseURL,
  timeout: appConfig.api.timeout,
  withCredentials: appConfig.api.withCredentials,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

async function clearAuthState() {
  // 完整清除認證狀態（localStorage + Pinia store）
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  try {
    const { useAuthStore } = await import('@/store/auth.store')
    const authStore = useAuthStore()
    authStore.clearAuth()
  } catch (err) {
    console.error('❌ 清除 store 狀態失敗:', err)
  }
}

function redirectToLogin() {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true

  // 導向登入頁（避免循環重定向）
  if (window.location.pathname !== '/login') {
    const redirect = `${window.location.pathname}${window.location.search}`
    window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
  }
}

async function probeTokenValid(token) {
  if (!token) return false
  if (authProbePromise) return await authProbePromise

  authProbePromise = (async () => {
    try {
      const resp = await authProbeClient.get('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return resp.status >= 200 && resp.status < 300
    } catch (err) {
      return false
    } finally {
      authProbePromise = null
    }
  })()

  return await authProbePromise
}

/**
 * 創建 Axios 實例
 * 配置基礎 URL、超時時間等
 */
const httpClient = axios.create({
  baseURL: appConfig.api.baseURL,
  timeout: appConfig.api.timeout,
  withCredentials: appConfig.api.withCredentials,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

/**
 * 請求攔截器
 * 在請求發送前進行處理，例如添加 token
 */
httpClient.interceptors.request.use(
  (config) => {
    // 允許個別請求跳過自動帶 token（例如：同支 API 依登入與否回傳不同欄位）
    if (config?.skipAuth) {
      console.log('📤 Request: skipAuth enabled')
      return config
    }

    // 從 localStorage 獲取 token
    const token = localStorage.getItem('token')

    // 如果 token 存在，添加到請求頭
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 可以在這裡添加其他請求頭或處理
    console.log('📤 Request:', config.method.toUpperCase(), config.url)
    console.log('📤 Request Params:', config.params)
    console.log('📤 Request Headers:', config.headers)

    return config
  },
  (error) => {
    // 請求錯誤處理
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 響應攔截器
 * 統一處理響應數據和錯誤
 */
httpClient.interceptors.response.use(
  (response) => {
    // 成功響應處理
    console.log('📥 Response:', response.status, response.config.url)

    // 直接返回 data 部分，簡化後續使用
    return response.data
  },
  async (error) => {
    // 錯誤響應處理
    console.error('❌ Response Error:', error)

    // 處理不同的 HTTP 狀態碼
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授權，完整清除認證狀態
          console.error('❌ 未授權，請重新登入')

          await clearAuthState()
          redirectToLogin()
          break

        case 403:
          // 禁止訪問
          console.warn('🚫 Forbidden - 沒有權限')

          // 有些後端會在 token 過期時回 403。
          // 為了避免「停留在同頁面點按鈕只看到沒有權限」的誤導體驗，
          // 這裡做一次輕量探測：若 token 其實已失效，就當作登出並導向登入。
          {
            const token = localStorage.getItem('token')
            const tokenValid = await probeTokenValid(token)
            if (!tokenValid) {
              console.warn('🔒 Token 可能已失效，請重新登入')
              await clearAuthState()
              redirectToLogin()
            }
          }
          break

        case 404:
          // 資源不存在
          console.warn('🔍 Not Found - 資源不存在')
          break

        case 422:
          // 表單驗證錯誤
          console.warn('⚠️ Validation Error:', data.errors || data.message)
          break

        case 500:
          // 服務器錯誤
          console.error('💥 Server Error - 伺服器錯誤')
          break

        default:
          console.error(`❌ HTTP Error ${status}:`, data.message || error.message)
      }

      // 返回格式化的錯誤信息
      return Promise.reject({
        status,
        message: data.message || error.message,
        errors: data.errors || null,
      })
    } else if (error.request) {
      // 請求已發送但沒有收到響應
      console.error('📡 Network Error - 無法連接到服務器')
      return Promise.reject({
        status: 0,
        message: '無法連接到服務器，請檢查網絡連接',
      })
    } else {
      // 其他錯誤
      console.error('⚠️ Error:', error.message)
      return Promise.reject({
        status: -1,
        message: error.message,
      })
    }
  }
)

/**
 * 導出 HTTP 客戶端實例
 */
export default httpClient
