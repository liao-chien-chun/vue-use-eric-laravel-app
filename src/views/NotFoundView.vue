<template>
  <div class="not-found-view">
    <div class="content">
      <h1>404</h1>
      <h2>頁面不存在</h2>
      <p>抱歉，您訪問的頁面不存在或已被移除</p>
      <router-link to="/" class="btn">返回首頁</router-link>
    </div>
  </div>
</template>

<script setup>
/**
 * 404 頁面
 */
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: white;
}

h1 {
  font-size: 8rem;
  margin: 0;
  font-weight: bold;
}

h2 {
  font-size: 2rem;
  margin: 20px 0 10px;
}

p {
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.btn {
  padding: 12px 32px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
}
</style>
