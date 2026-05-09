# Claude Agent Skills

此資料夾包含專案的自定義 Claude Agent Skills，用於協助開發 Vue3 + Laravel 專案。

## 可用的 Skills

### 1. **vue-component.md**
建立新的 Vue 3 組件
- 使用 Composition API
- 遵循專案編碼規範
- 包含完整註解

### 2. **api-service.md**
建立 API 服務模組
- 可繼承 BaseAPI
- 統一的錯誤處理
- 完整的 JSDoc 註解

### 3. **pinia-store.md**
建立 Pinia Store
- Composition API 風格
- 包含 State、Getters、Actions
- 統一的錯誤處理

### 4. **vue-page.md**
建立新的頁面組件
- 自動配置路由
- 包含 loading 和 error 處理
- 響應式設計

### 5. **laravel-integration.md**
Laravel API 串接指南
- CORS 配置
- 認證流程
- 常見問題排查

## 如何使用

在與 Claude 對話時，Claude 會自動參考這些 skills 來協助你：

- **建立組件**: "幫我建立一個產品卡片組件"
- **建立 API**: "我需要一個產品 API 服務"
- **建立 Store**: "建立產品狀態管理"
- **建立頁面**: "新增一個產品列表頁面"
- **串接 API**: "如何串接我的 Laravel API？"

## Skills 特色

✅ 遵循專案編碼規範
✅ 完整的中文註解
✅ 統一的錯誤處理
✅ 業界最佳實踐
✅ 可擴展的架構

## 自訂 Skills

你可以根據需求添加新的 skills：

1. 在 `.claude/skills/` 建立新的 Markdown 檔案
2. 使用清楚的標題和步驟說明
3. 提供範例程式碼
4. 列出注意事項

## 範例結構

```markdown
# Skill 名稱

簡短說明這個 skill 的用途。

## 使用方式

何時使用此 skill。

## 步驟

1. 第一步
2. 第二步
3. 第三步

## 範例

```javascript
// 範例程式碼
```

## 注意事項

- 注意事項 1
- 注意事項 2
```

---

建立日期: 2024-05-09
