import {
  defineConfig,
  type Plugin,
} from 'vite'
import react from '@vitejs/plugin-react'

const buildId = new Date().toISOString()

const appVersion = process.env.npm_package_version ?? '0.0.0'

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
    __APP_VERSION__: JSON.stringify(appVersion),
  },
})