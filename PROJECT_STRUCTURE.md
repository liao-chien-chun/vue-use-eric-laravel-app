# Vue3 Laravel Demo - 專案結構說明

## 專案概述

這是一個專業的 Vue3 + Laravel API 整合專案，採用業界標準的資料夾分層架構，適合作為面試展示或實際專案的基礎架構。

## 技術棧

- **Vue 3** - 漸進式 JavaScript 框架
- **Vite** - 下一代前端建置工具
- **Vue Router 4** - 官方路由管理器
- **Pinia** - Vue 官方推薦的狀態管理工具
- **Axios** - Promise 基礎的 HTTP 客戶端

## 資料夾結構

```
vue-demo/
├── public/                 # 靜態資源（不會被 Vite 處理）
├── src/
│   ├── api/               # API 服務層
│   │   ├── base.api.js   # 基礎 API 類別（提供 CRUD 方法）
│   │   ├── auth.api.js   # 認證相關 API
│   │   └── user.api.js   # 使用者相關 API
│   │
│   ├── assets/            # 靜態資源（會被 Vite 處理）
│   │
│   ├── components/        # 可重用組件
│   │   ├── common/       # 通用組件（按鈕、輸入框等）
│   │   ├── layout/       # 佈局組件（Header、Footer 等）
│   │   └── forms/        # 表單組件
│   │
│   ├── composables/       # 組合式函數（Composition API）
│   │
│   ├── config/            # 配置文件
│   │   └── app.config.js # 應用程式全域配置
│   │
│   ├── constants/         # 常量定義
│   │   └── index.js      # 常量集合（HTTP 狀態碼、角色等）
│   │
│   ├── router/            # 路由配置
│   │   └── index.js      # Vue Router 設定
│   │
│   ├── services/          # 業務邏輯服務（可選）
│   │
│   ├── store/             # Pinia 狀態管理
│   │   └── auth.store.js # 認證狀態管理
│   │
│   ├── styles/            # 全域樣式
│   │
│   ├── utils/             # 工具函數
│   │   ├── http.js       # HTTP 客戶端（Axios 封裝）
│   │   ├── format.js     # 格式化工具
│   │   └── validation.js # 驗證工具
│   │
│   ├── views/             # 頁面組件
│   │   ├── auth/         # 認證相關頁面
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   ├── users/        # 使用者管理頁面
│   │   │   ├── UserListView.vue
│   │   │   └── UserDetailView.vue
│   │   ├── HomeView.vue
│   │   ├── DashboardView.vue
│   │   ├── ProfileView.vue
│   │   └── NotFoundView.vue
│   │
│   ├── App.vue           # 根組件
│   ├── main.js           # 應用程式入口
│   └── style.css         # 全域樣式
│
├── .env                   # 環境變數（不應提交到 Git）
├── .env.example           # 環境變數範例
├── .gitignore
├── index.html
├── package.json
├── vite.config.js         # Vite 配置
└── PROJECT_STRUCTURE.md   # 本文件

```

## 核心功能模組說明

### 1. API 層 (`src/api/`)

負責所有與後端 API 的交互，採用分層設計：

- **base.api.js**: 提供通用的 CRUD 操作基類
- **auth.api.js**: 認證相關（登入、註冊、登出）
- **user.api.js**: 使用者相關操作（繼承自 BaseAPI）

**特色**:
- 統一的 API 調用方式
- 自動處理 token
- 統一的錯誤處理

### 2. 狀態管理 (`src/store/`)

使用 Pinia 進行狀態管理：

- **auth.store.js**: 管理使用者認證狀態、登入登出等

**特色**:
- 採用 Composition API 風格
- 清晰的 State、Getters、Actions 分離
- 自動持久化 token

### 3. 路由管理 (`src/router/`)

使用 Vue Router 4 進行路由管理：

**特色**:
- 路由懶加載（提升首屏載入速度）
- 路由守衛（認證檢查）
- 自動設置頁面標題
- 記錄登入前的目標頁面

### 4. HTTP 客戶端 (`src/utils/http.js`)

基於 Axios 封裝的 HTTP 客戶端：

**特色**:
- 請求/響應攔截器
- 自動添加 token
- 統一的錯誤處理
- 支援不同 HTTP 狀態碼的處理

### 5. 工具函數 (`src/utils/`)

提供常用的工具函數：

- **format.js**: 日期、數字、金額等格式化
- **validation.js**: 表單驗證（Email、密碼、電話等）

### 6. 常量管理 (`src/constants/`)

集中管理所有常量，避免魔法數字和字串：

- HTTP 狀態碼
- 使用者角色和狀態
- 正則表達式
- 分頁設定等

## 環境變數配置

複製 `.env.example` 為 `.env` 並修改：

```bash
cp .env.example .env
```

重要環境變數：

```env
# Laravel API 基礎 URL
VITE_API_BASE_URL=http://localhost:8000/api

# API 超時設定（毫秒）
VITE_API_TIMEOUT=30000

# 應用程式名稱
VITE_APP_NAME=Vue3 Laravel Demo
```

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

預設會在 http://localhost:3000 啟動

### 3. 建置生產版本

```bash
npm run build
```

### 4. 預覽生產版本

```bash
npm run preview
```

## 路由說明

| 路徑 | 組件 | 說明 | 需要認證 |
|------|------|------|----------|
| / | HomeView | 首頁 | 否 |
| /login | LoginView | 登入頁 | 否 |
| /register | RegisterView | 註冊頁 | 否 |
| /dashboard | DashboardView | 控制台 | 是 |
| /profile | ProfileView | 個人資料 | 是 |
| /users | UserListView | 使用者列表 | 是 |
| /users/:id | UserDetailView | 使用者詳情 | 是 |
| * | NotFoundView | 404 頁面 | 否 |

## API 串接範例

### 登入範例

```javascript
import { authAPI } from '@/api/auth.api'

const login = async () => {
  try {
    const response = await authAPI.login({
      email: 'user@example.com',
      password: 'password123'
    })
    console.log('登入成功:', response)
  } catch (error) {
    console.error('登入失敗:', error.message)
  }
}
```

### 使用 BaseAPI

```javascript
import { userAPI } from '@/api/user.api'

// 獲取所有使用者
const users = await userAPI.getAll({ page: 1, per_page: 10 })

// 獲取單一使用者
const user = await userAPI.getById(1)

// 創建使用者
const newUser = await userAPI.create({ name: '張三', email: 'zhang@example.com' })

// 更新使用者
const updatedUser = await userAPI.update(1, { name: '張三三' })

// 刪除使用者
await userAPI.delete(1)
```

## 程式碼規範

### 命名規範

- **組件**: PascalCase (例如: `UserListView.vue`)
- **文件夾**: kebab-case (例如: `auth-api/`)
- **文件**: kebab-case (例如: `auth.api.js`)
- **變數**: camelCase (例如: `userName`)
- **常量**: UPPER_SNAKE_CASE (例如: `API_BASE_URL`)

### 註解規範

所有檔案都包含詳細的註解，說明：
- 檔案用途
- 函數功能
- 參數說明
- 返回值說明

## 架構優勢

1. **分層清晰**: API、狀態管理、路由、視圖分離
2. **易於維護**: 邏輯集中，職責單一
3. **可擴展性**: 基於 BaseAPI 可快速擴展新的 API
4. **類型安全**: 使用常量避免硬編碼
5. **錯誤處理**: 統一的錯誤處理機制
6. **安全性**: 自動處理 token，路由守衛保護

## 後續擴展建議

1. **TypeScript**: 添加類型檢查
2. **UI 框架**: 整合 Element Plus 或 Ant Design Vue
3. **測試**: 添加單元測試和 E2E 測試
4. **國際化**: 使用 vue-i18n
5. **主題系統**: 支援深色模式
6. **權限系統**: 細粒度的權限控制
7. **WebSocket**: 實時通訊功能

## 常見問題

### 1. CORS 錯誤

確保 Laravel API 已正確配置 CORS，允許前端域名訪問。

### 2. Token 過期處理

HTTP 客戶端已自動處理 401 錯誤，會清除 token 並跳轉登入頁。

### 3. 路徑別名不生效

確保 Vite 配置中已正確設置路徑別名：

```javascript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

## 聯絡資訊

如有任何問題或建議，歡迎聯繫。

---

**最後更新**: 2024-05-09
**版本**: 1.0.0
