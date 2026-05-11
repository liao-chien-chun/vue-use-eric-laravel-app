# Vue3 Laravel Demo - 面試展示專案

> 一個專業的 Vue3 + Laravel API 整合範例，採用業界標準的資料夾結構和最佳實踐

## 專案特色

✨ **現代化技術棧**
- Vue 3 with Composition API
- Vite 5 - 極速的開發體驗
- Vue Router 4 - 官方路由解決方案
- Pinia - Vue 官方狀態管理
- Axios - 優雅的 HTTP 客戶端

🏗️ **專業架構**
- 清晰的分層架構設計
- 業界標準的資料夾結構
- 統一的 API 服務層
- 可重用的組件系統
- 完整的錯誤處理機制

📝 **完整註解**
- 所有檔案都包含詳細的中文註解
- 清楚的函數說明和參數說明
- 適合學習和面試展示

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變數

複製 `.env.example` 為 `.env` 並修改：

```bash
cp .env.example .env
```

修改 Laravel API 的基礎 URL：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

專案將在 http://localhost:3000 啟動

### 4. 建置生產版本

```bash
npm run build
```

## 詳細說明

請查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 獲取完整的專案結構和使用說明。

## 核心功能

- ✅ 使用者認證（登入/登出/註冊）
- ✅ 統一的 API 服務層（BaseAPI + 繼承）
- ✅ Pinia 狀態管理
- ✅ Vue Router 路由守衛
- ✅ HTTP 請求/響應攔截器
- ✅ Token 自動管理
- ✅ 可重用組件（LoadingSpinner、BaseButton）
- ✅ Composables（useLoading、usePagination）
- ✅ 工具函數（格式化、驗證）
- ✅ 常量管理

## 技術亮點

1. **清晰的分層架構** - API、Store、Router、Views 分離
2. **完整的中文註解** - 所有檔案都有詳細說明
3. **統一的錯誤處理** - HTTP 攔截器自動處理各種錯誤
4. **可擴展設計** - BaseAPI 繼承模式，輕鬆擴展新功能
5. **安全性** - Token 管理、路由守衛、CORS 配置
