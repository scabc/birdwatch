import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ECharts 核心单独打包
          if (id.includes('echarts/core')) return 'echarts-core';
          // ECharts 图表组件按需加载（通过动态 import）
          if (id.includes('echarts/chart')) return 'echarts-charts';
          // ECharts 组件
          if (id.includes('echarts/component')) return 'echarts-components';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
