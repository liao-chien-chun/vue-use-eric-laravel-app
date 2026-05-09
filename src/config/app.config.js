/**
 * 應用程式全域配置
 * 集中管理所有環境變數和應用設定
 */

export const appConfig = {
  // 應用程式名稱
  appName: import.meta.env.VITE_APP_NAME || 'Vue3 Laravel Demo',

  // API 相關配置
  api: {
    // API 基礎 URL
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    // 請求超時時間（毫秒）
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    // 是否攜帶認證憑證
    withCredentials: true,
  },

  // 開發模式
  isDev: import.meta.env.DEV,
  // 生產模式
  isProd: import.meta.env.PROD,
}

export default appConfig
