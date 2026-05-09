# Vue Component Generator

建立一個新的 Vue 3 組件，遵循專案的編碼規範。

## 使用方式

當用戶要求建立新組件時，使用此 skill。

## 步驟

1. 詢問用戶：
   - 組件名稱（使用 PascalCase）
   - 組件類型（common/layout/forms）
   - 組件功能描述

2. 在 `src/components/{類型}/` 建立組件檔案

3. 組件範本應包含：
   - `<script setup>` 使用 Composition API
   - 完整的中文註解
   - Props 定義和說明
   - Emits 定義（如需要）
   - 適當的樣式（scoped）

## 範例

```vue
<template>
  <div class="component-name">
    <!-- 組件內容 -->
  </div>
</template>

<script setup>
/**
 * 組件說明
 * 描述此組件的用途
 */

// Props 定義
const props = defineProps({
  // 屬性名稱
  propName: {
    type: String,
    default: '',
    required: false,
  },
})

// Emits 定義
const emit = defineEmits(['eventName'])
</script>

<style scoped>
.component-name {
  /* 樣式 */
}
</style>
```

## 注意事項

- 組件名稱使用 PascalCase
- 所有註解使用中文
- 遵循專案的 ESLint 規範
- 樣式使用 scoped
