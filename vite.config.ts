import {
  defineConfig,
  type Plugin,
} from 'vite'
import react from '@vitejs/plugin-react'

const buildId = new Date().toISOString()

function injectBuildId(): Plugin {
  return {
    name: 'inject-build-id',

    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: {
            name: 'app-build-id',
            content: buildId,
          },
          injectTo: 'head',
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/haishin-box/',

  plugins: [
    react(),
    injectBuildId(),
  ],

  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
})