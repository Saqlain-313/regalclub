import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Graceful proxy error handling - when the backend (nodemon) restarts,
// open API/socket connections break and http-proxy prints a stack trace
// for every dropped request. Instead, return a clean 502 and log a
// single short line so the dev terminal stays readable.
const gracefulProxy = {
  configure: (proxy) => {
    proxy.on('error', (err, req, res) => {
      if (res && typeof res.writeHead === "function" && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            success: false,
            message: 'Backend is restarting, please retry',
          }),
        )
      }
      console.warn(
        `[proxy] backend not reachable (${err.code || err.message}) - retrying shortly`,
      )
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9099',
        changeOrigin: true,
        ...gracefulProxy,
      },
      // Trading app raw websocket (merged from the trading subdomain)
      '/ws': {
        target: 'ws://localhost:9099',
        ws: true,
        ...gracefulProxy,
      },
      '/socket.io': {
        target: 'http://localhost:9099',
        changeOrigin: true,
        ws: true,
        ...gracefulProxy,
      },
    },
  },
})
