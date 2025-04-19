import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load the root .env file
dotenv.config({ path: '../.env' })

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
    'process.env': {},
    'process.env.PINATA_API_KEY': JSON.stringify(process.env.PINATA_API_KEY),
    'process.env.PINATA_SECRET_KEY': JSON.stringify(process.env.PINATA_SECRET_KEY),
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util'
    }
  }
})
