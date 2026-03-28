import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const PUBLIC_DIR = resolve(__dirname, '../../public')
const IMG_DIR = resolve(PUBLIC_DIR, 'img')

describe('PWA manifest and assets', () => {
  const requiredIcons = [
    'icon-192x192.png',
    'icon-512x512.png',
    'icon-maskable-192x192.png',
    'icon-maskable-512x512.png',
  ]

  it.each(requiredIcons)('icon %s exists in public/img', (icon) => {
    expect(existsSync(resolve(IMG_DIR, icon))).toBe(true)
  })

  it('every icon file is a valid PNG (has PNG magic bytes)', () => {
    const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    for (const icon of requiredIcons) {
      const data = readFileSync(resolve(IMG_DIR, icon))
      expect(data.subarray(0, 4)).toEqual(PNG_MAGIC)
    }
  })

  it('vite.config.ts manifest defines required PWA fields', async () => {
    const configSrc = readFileSync(resolve(__dirname, '../../vite.config.ts'), 'utf8')
    expect(configSrc).toContain("display: 'standalone'")
    expect(configSrc).toContain("start_url: '/'")
    expect(configSrc).toContain('192x192')
    expect(configSrc).toContain('512x512')
    expect(configSrc).toContain("registerType: 'autoUpdate'")
  })

  it('index.html does not contain a hardcoded /manifest.json link', () => {
    const indexHtml = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')
    expect(indexHtml).not.toContain('/manifest.json')
  })

  it('main.tsx registers the service worker via virtual:pwa-register', () => {
    const mainSrc = readFileSync(resolve(__dirname, '../main.tsx'), 'utf8')
    expect(mainSrc).toContain("virtual:pwa-register")
    expect(mainSrc).toContain('registerSW')
  })
})
