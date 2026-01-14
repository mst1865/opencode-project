import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 关键配置：本地开发时的反向代理
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // 指向你本地运行的后端地址
        changeOrigin: true,
        secure: false, // 如果本地后端是 https 但没有证书，设为 false
        // 这一行看你的后端路由。
        // 如果你的 Controller 路由是 [Route("api/[controller]")]，后端确实需要 /api 前缀，则不需要 rewrite
        // 如果后端路由没有 api 前缀，才需要 rewrite 去掉它。
        // 根据你之前的代码，你的后端是有 /api 前缀的，所以这里不需要 rewrite。
      }
    }
  }
})