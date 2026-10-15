import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert({
      hosts: ["presently.teste.com"],
      savePath: './certs',
    })
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "https://localhost:8443",
        changeOrigin: true,
        secure: false,
      },
      "/security": {
        target: "https://localhost:8443",
        changeOrigin: true,
        secure: false,
      },
      "/webauthn": {
        target: "https://localhost:8443",
        changeOrigin: true,
        secure: false,
      },
      "/login/webauthn": {
        target: "https://localhost:8443",
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
