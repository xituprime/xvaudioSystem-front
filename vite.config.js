import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const stripApi = env.VITE_PROXY_STRIP_API === 'true'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          rewrite: stripApi ? (path) => path.replace(/^\/api/, '') : undefined,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.warn('[proxy]', req.url, err.message)
            })
          },
        },
        '/uploads': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
