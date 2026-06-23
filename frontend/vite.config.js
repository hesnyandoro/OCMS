import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'chart-vendor'
          }
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('yup')) {
            return 'form-vendor'
          }
          if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('react-datepicker') || id.includes('react-select')) {
            return 'ui-vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
