import { createHtmlPlugin } from 'vite-plugin-html'
export default {
  plugins: [createHtmlPlugin()],
  build: { chunkSizeWarningLimit: 1000 }
}
