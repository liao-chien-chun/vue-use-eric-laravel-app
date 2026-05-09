<template>
  <div class="loading-spinner" :class="{ 'is-overlay': overlay }">
    <div class="spinner" :style="{ width: size, height: size }"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
/**
 * 載入動畫組件
 * 可用於頁面載入、按鈕載入等場景
 */

defineProps({
  // 是否顯示為全屏遮罩
  overlay: {
    type: Boolean,
    default: false,
  },
  // 載入文字
  text: {
    type: String,
    default: '',
  },
  // 動畫大小
  size: {
    type: String,
    default: '40px',
  },
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.loading-spinner.is-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin: 0;
}
</style>
