import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev proxy forwards /api/nanobanana/* → NanoBanana API with Bearer auth from `.env.local` NANO_BANANA_API_KEY.
 * Keeps API keys off the SPA bundle — in production configure the same rewrite on nginx / serverless proxy.
 *
 * Docs: https://docs.nanobananaapi.ai/
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const nanoBananaApiKey = env.NANO_BANANA_API_KEY ?? ''

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/nanobanana': {
          target: 'https://api.nanobananaapi.ai',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/nanobanana/, '/api/v1/nanobanana'),
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (nanoBananaApiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${nanoBananaApiKey}`)
              }
            })
          },
        },
      },
    },
  }
})
