import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // 路徑別名設定
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 開發伺服器配置
  server: {
    port: 3000,
    open: true, // 自動開啟瀏覽器
    cors: true, // 啟用 CORS
  },

  // 建置配置
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 移除 console 和 debugger（生產環境）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
