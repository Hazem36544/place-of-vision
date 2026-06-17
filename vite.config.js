import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/place-of-vision/', // تم الحفاظ على المسار الخاص بك
  build: {
    // رفع الحد الأقصى للتحذير إلى 1000 كيلوبايت
    chunkSizeWarningLimit: 1000, 
    
    rollupOptions: {
      output: {
        // فصل المكتبات الخارجية في ملف منفصل اسمه vendor لتسريع التحميل
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})