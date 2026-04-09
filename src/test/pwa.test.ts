import { describe, it, expect } from 'vitest'

// Use Vite's glob to check icon files exist under public/img/
const pngGlob = import.meta.glob('/public/img/*.png')

// Read source files as raw strings via Vite's ?raw query (no Node.js APIs needed)
import viteConfigSrc from '../../vite.config.ts?raw'
import indexHtmlSrc from '../../index.html?raw'
import mainTsxSrc from '../main.tsx?raw'

describe('PWA manifest and assets', () => {
  const requiredIcons = [
    '/public/img/icon-192x192.png',
    '/public/img/icon-512x512.png',
    '/public/img/icon-maskable-192x192.png',
    '/public/img/icon-maskable-512x512.png',
  ]

  it.each(requiredIcons)('icon %s exists in public/img', (icon) => {
    expect(pngGlob[icon]).toBeDefined()
  })

  it('vite.config.ts manifest defines required PWA fields', () => {
    expect(viteConfigSrc).toContain("display: 'standalone'")
    expect(viteConfigSrc).toContain("start_url: '/'")
    expect(viteConfigSrc).toContain('192x192')
    expect(viteConfigSrc).toContain('512x512')
    expect(viteConfigSrc).toContain("registerType: 'autoUpdate'")
  })

  it('index.html does not contain a hardcoded /manifest.json link', () => {
    expect(indexHtmlSrc).not.toContain('/manifest.json')
  })

  it('main.tsx registers the service worker via virtual:pwa-register', () => {
    expect(mainTsxSrc).toContain('virtual:pwa-register')
    expect(mainTsxSrc).toContain('registerSW')
  })
})

