import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import prerender from '@prerenderer/rollup-plugin'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'
import chromium from '@sparticuz/chromium'

const executablePath = await chromium.executablePath()

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    prerender({
      routes: ['/'],
      renderer: new PuppeteerRenderer({
        renderAfterTime: 1500,
        launchOptions: {
          executablePath,
          args: chromium.args,
          headless: chromium.headless,
        },
      }),
    }),
  ],
})
