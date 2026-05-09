# Vue Page Generator

建立新的頁面組件並配置路由。

## 使用方式

當用戶需要添加新頁面時使用此 skill。

## 步驟

1. 詢問用戶：
   - 頁面名稱（例如：Products, Orders）
   - 頁面路徑（例如：/products, /orders）
   - 是否需要認證
   - 頁面功能描述

2. 在 `src/views/` 建立頁面組件
   - 如果是相關頁面，可建立子資料夾（例如：`products/ProductListView.vue`）

3. 在 `src/router/index.js` 添加路由配置

4. 頁面應包含：
   - 完整的 HTML 結構
   - Composition API
   - 響應式資料
   - 生命週期鉤子（如需要）
   - 樣式（scoped）
   - 完整的中文註解

## 頁面範本

```vue
<template>
  <div class="page-name-view">
    <!-- 頁面標題 -->
    <h1>頁面標題</h1>

    <!-- 工具列 -->
    <div class="toolbar">
      <!-- 搜尋、篩選、操作按鈕等 -->
    </div>

    <!-- 主要內容區 -->
    <div class="content">
      <!-- 載入中 -->
      <LoadingSpinner v-if="loading" />

      <!-- 錯誤訊息 -->
      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <!-- 資料展示 -->
      <div v-else>
        <!-- 內容 -->
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 頁面名稱
 * 頁面功能描述
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()

// ========== 響應式資料 ==========

const loading = ref(false)
const error = ref(null)
const data = ref([])

// ========== 方法 ==========

/**
 * 獲取資料
 */
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    // 調用 API
    // const response = await someAPI.getData()
    // data.value = response.data
  } catch (err) {
    error.value = err.message || '獲取資料失敗'
    console.error('❌ 錯誤:', err)
  } finally {
    loading.value = false
  }
}

// ========== 生命週期 ==========

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-name-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error {
  color: #e74c3c;
  padding: 20px;
  text-align: center;
}
</style>
```

## 路由配置範例

在 `src/router/index.js` 添加：

```javascript
{
  path: '/page-path',
  name: 'PageName',
  component: () => import('@/views/PageNameView.vue'),
  meta: {
    title: '頁面標題',
    requiresAuth: true, // 是否需要登入
  },
}
```

## 注意事項

- 頁面組件命名使用 PascalCase + View 後綴
- 使用路由懶加載
- 所有註解使用中文
- 處理 loading 和 error 狀態
- 使用現有的可重用組件
