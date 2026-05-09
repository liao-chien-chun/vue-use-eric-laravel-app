/**
 * 錯誤處理工具
 * 統一處理 API 錯誤訊息格式
 */

/**
 * 格式化錯誤訊息
 *
 * 後端錯誤格式有兩種：
 * 1. 一般錯誤（401, 500 等）：{ message: "錯誤訊息" }
 * 2. 驗證錯誤（422）：{ message: "驗證失敗", errors: { field: ["錯誤1", "錯誤2"] } }
 *
 * @param {Object} error - 錯誤對象
 * @param {string} error.message - 錯誤訊息
 * @param {Object} error.errors - 驗證錯誤詳情（422 專用）
 * @param {string} defaultMessage - 預設錯誤訊息
 * @returns {string} 格式化後的錯誤訊息
 */
export function formatErrorMessage(error, defaultMessage = '操作失敗') {
  // 如果有驗證錯誤（422），優先顯示詳細錯誤訊息
  if (error.errors && typeof error.errors === 'object') {
    // 將所有欄位的錯誤訊息收集起來
    const errorMessages = Object.values(error.errors)
      .flat() // 攤平陣列（因為每個欄位可能有多個錯誤）
      .filter(msg => msg) // 過濾空值

    // 用頓號串接多個錯誤訊息
    return errorMessages.length > 0
      ? errorMessages.join('、')
      : (error.message || defaultMessage)
  }

  // 一般錯誤，直接返回 message
  return error.message || defaultMessage
}

/**
 * 處理 API 錯誤
 * 根據不同的錯誤狀態碼執行對應的處理
 *
 * @param {Object} error - 錯誤對象
 * @param {number} error.status - HTTP 狀態碼
 * @returns {void}
 */
export function handleApiError(error) {
  switch (error.status) {
    case 401:
      // 未授權，可能需要跳轉登入
      console.warn('🔒 未授權，請重新登入')
      break

    case 403:
      // 權限不足
      console.warn('🚫 權限不足')
      break

    case 404:
      // 資源不存在
      console.warn('🔍 資源不存在')
      break

    case 422:
      // 驗證錯誤
      console.warn('⚠️ 驗證錯誤:', error.errors)
      break

    case 500:
      // 伺服器錯誤
      console.error('💥 伺服器錯誤')
      break

    default:
      console.error('❌ 未知錯誤:', error)
  }
}
