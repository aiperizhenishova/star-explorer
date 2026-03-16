import { defineConfig } from 'vite'

export default defineConfig({
  base: '/star-explorer/',   // название репозитория
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    moduleNameMapper:{
      '^/assests/.*': '/src/fileMock.js',
      'three/.*': '/scr/fileMock.js'
    }
  }
})
