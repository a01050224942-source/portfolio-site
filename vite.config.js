import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: "/portfolio-site/",
  plugins: [react()],
  server: {
    proxy: {
      // 프론트엔드의 /api 요청을 감지하면 백엔드 8080 포트로 강제 우회 포워딩
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})