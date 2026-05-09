/**
 * 表單驗證工具函數
 * 提供常用的輸入驗證功能
 */

/**
 * 驗證 Email 格式
 * @param {string} email - Email 地址
 * @returns {boolean} 是否為有效的 Email
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 驗證密碼強度
 * @param {string} password - 密碼
 * @param {Object} options - 驗證選項
 * @returns {Object} 驗證結果 { isValid, message, strength }
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options

  const errors = []

  // 檢查長度
  if (password.length < minLength) {
    errors.push(`密碼至少需要 ${minLength} 個字元`)
  }

  // 檢查大寫字母
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密碼需包含至少一個大寫字母')
  }

  // 檢查小寫字母
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密碼需包含至少一個小寫字母')
  }

  // 檢查數字
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('密碼需包含至少一個數字')
  }

  // 檢查特殊字元
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密碼需包含至少一個特殊字元')
  }

  // 計算密碼強度
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  const strengthLevel = strength <= 2 ? 'weak' : strength <= 4 ? 'medium' : 'strong'

  return {
    isValid: errors.length === 0,
    message: errors.join('、'),
    strength: strengthLevel,
  }
}

/**
 * 驗證台灣手機號碼
 * @param {string} phone - 手機號碼
 * @returns {boolean} 是否為有效的台灣手機號碼
 */
export function isValidTaiwanPhone(phone) {
  if (!phone) return false
  const cleaned = phone.replace(/\D/g, '')
  // 台灣手機號碼：09 開頭，共 10 碼
  return /^09\d{8}$/.test(cleaned)
}

/**
 * 驗證身分證字號（台灣）
 * @param {string} id - 身分證字號
 * @returns {boolean} 是否為有效的身分證字號
 */
export function isValidTaiwanID(id) {
  if (!id || id.length !== 10) return false

  const regex = /^[A-Z][12]\d{8}$/
  if (!regex.test(id)) return false

  // 字母對應數字
  const letterMap = {
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
    K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
    U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
  }

  const firstLetter = id[0]
  const letterNum = letterMap[firstLetter]

  // 計算檢查碼
  const digits = [
    Math.floor(letterNum / 10),
    letterNum % 10,
    ...id.substring(1).split('').map(Number),
  ]

  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0)

  return sum % 10 === 0
}

/**
 * 驗證 URL 格式
 * @param {string} url - URL
 * @returns {boolean} 是否為有效的 URL
 */
export function isValidURL(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 驗證必填欄位
 * @param {any} value - 值
 * @returns {boolean} 是否已填寫
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * 驗證最小長度
 * @param {string} value - 值
 * @param {number} min - 最小長度
 * @returns {boolean} 是否符合最小長度
 */
export function minLength(value, min) {
  if (!value) return false
  return value.length >= min
}

/**
 * 驗證最大長度
 * @param {string} value - 值
 * @param {number} max - 最大長度
 * @returns {boolean} 是否符合最大長度
 */
export function maxLength(value, max) {
  if (!value) return true
  return value.length <= max
}

export default {
  isValidEmail,
  validatePassword,
  isValidTaiwanPhone,
  isValidTaiwanID,
  isValidURL,
  isRequired,
  minLength,
  maxLength,
}
