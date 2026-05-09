<template>
  <div class="register-view">
    <div class="register-card">
      <h2>註冊帳號</h2>
      <p class="subtitle">建立您的帳號，開始使用</p>

      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 姓名 -->
        <div class="form-group">
          <label for="name">姓名</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="請輸入您的姓名"
            required
            :disabled="authStore.loading"
          />
        </div>

        <!-- Email -->
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

        <!-- 密碼 -->
        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="至少 8 個字元"
            required
            :disabled="authStore.loading"
          />
        </div>

        <!-- 確認密碼 -->
        <div class="form-group">
          <label for="password_confirmation">確認密碼</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            placeholder="再次輸入密碼"
            required
            :disabled="authStore.loading"
          />
        </div>

        <!-- 註冊按鈕 -->
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? '註冊中...' : '註冊' }}
        </button>
      </form>

      <!-- 登入連結 -->
      <p class="login-link">
        已經有帳號了？
        <router-link to="/login">立即登入</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
/**
 * 註冊頁面組件
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const handleRegister = async () => {
  // 檢查密碼是否一致
  if (form.value.password !== form.value.password_confirmation) {
    authStore.error = '密碼不一致'
    return
  }

  const success = await authStore.register(form.value)

  if (success) {
    // 註冊成功，跳轉到登入頁面
    alert('註冊成功！請登入')
    router.push('/login')
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
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

.register-form {
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

.form-group input {
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

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
