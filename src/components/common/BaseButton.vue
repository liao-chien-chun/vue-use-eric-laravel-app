<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['base-button', variant, { 'is-loading': loading }]"
    @click="handleClick"
  >
    <span v-if="loading" class="loader"></span>
    <span v-else>
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
/**
 * 基礎按鈕組件
 * 可重用的按鈕，支援載入狀態、不同樣式等
 */

const props = defineProps({
  // 按鈕類型
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  // 按鈕樣式
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning'].includes(value),
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 是否載入中
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-width: 100px;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-button.is-loading {
  pointer-events: none;
}

/* 按鈕樣式變體 */
.base-button.primary {
  background: #667eea;
  color: white;
}

.base-button.primary:hover:not(:disabled) {
  background: #5568d3;
}

.base-button.secondary {
  background: #6c757d;
  color: white;
}

.base-button.secondary:hover:not(:disabled) {
  background: #5a6268;
}

.base-button.success {
  background: #28a745;
  color: white;
}

.base-button.success:hover:not(:disabled) {
  background: #218838;
}

.base-button.danger {
  background: #e74c3c;
  color: white;
}

.base-button.danger:hover:not(:disabled) {
  background: #c0392b;
}

.base-button.warning {
  background: #f39c12;
  color: white;
}

.base-button.warning:hover:not(:disabled) {
  background: #e67e22;
}

/* 載入動畫 */
.loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
