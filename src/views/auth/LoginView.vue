<template>
  <div class="login-view">
    <div class="login-card">
      <h2>登入</h2>
      <p class="subtitle">歡迎回來！請登入您的帳號</p>

      <!-- 錯誤訊息 -->
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Email 輸入 -->
        <div class="form-group">
          <label for="email">電子郵件</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="請輸入您的 Email"
            required
            :disabled="authStore.loading"
          />
        </div>

        <!-- 密碼輸入 -->
        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="請輸入您的密碼"
            required
            :disabled="authStore.loading"
          />
        </div>

        <!-- 登入按鈕 -->
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? '登入中...' : '登入' }}
        </button>
      </form>

      <!-- 註冊連結 -->
      <p class="register-link">
        還沒有帳號？
        <router-link to="/register">立即註冊</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
/**
 * 登入頁面組件
 * 處理使用者登入邏輯
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

// 表單資料
const form = ref({
  email: '',
  password: '',
})

/**
 * 處理登入
 */
const handleLogin = async () => {
  const success = await authStore.login({
    email: form.value.email,
    password: form.value.password,
  })

  if (success) {
    // 登入成功，跳轉到我的文章 或原本要去的頁面
    const redirect = router.currentRoute.value.query.redirect || '/posts/my'
    router.push(redirect)
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 0.9rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input[type="email"],
.form-group input[type="password"] {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 14px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
