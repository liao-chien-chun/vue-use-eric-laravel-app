/**
 * 格式化工具函數
 * 提供常用的資料格式化功能
 */

/**
 * 格式化日期時間
 * @param {string|Date} date - 日期
 * @param {string} format - 格式（'date', 'time', 'datetime'）
 * @returns {string} 格式化後的日期字串
 */
export function formatDate(date, format = 'datetime') {
  if (!date) return ''

  const d = new Date(date)

  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

/**
 * 格式化數字為千分位
 * @param {number} num - 數字
 * @returns {string} 格式化後的數字字串
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化金額
 * @param {number} amount - 金額
 * @param {string} currency - 貨幣符號
 * @returns {string} 格式化後的金額字串
 */
export function formatCurrency(amount, currency = 'NT$') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency} 0`
  }
  return `${currency} ${formatNumber(amount)}`
}

/**
 * 格式化檔案大小
 * @param {number} bytes - 位元組數
 * @returns {string} 格式化後的檔案大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 截斷文字
 * @param {string} text - 文字
 * @param {number} length - 最大長度
 * @param {string} suffix - 後綴（預設為 '...'）
 * @returns {string} 截斷後的文字
 */
export function truncate(text, length = 50, suffix = '...') {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + suffix
}

/**
 * 格式化電話號碼（台灣手機）
 * @param {string} phone - 電話號碼
 * @returns {string} 格式化後的電話號碼
 */
export function formatPhone(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')

  // 台灣手機號碼格式：0912-345-678
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`
  }

  return phone
}

export default {
  formatDate,
  formatNumber,
  formatCurrency,
  formatFileSize,
  truncate,
  formatPhone,
}
