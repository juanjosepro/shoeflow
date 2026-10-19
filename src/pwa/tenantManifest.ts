const VITE_APP_URL = import.meta.env.VITE_APP_URL;
const VITE_APP_NAME = import.meta.env.VITE_APP_NAME;
const RESERVED = new Set(['www', 'app', 'api', 'admin'])

function getTenantName(): string {
  const host = location.hostname.toLowerCase()
  const suffix = [`.${VITE_APP_URL}`, '.localhost'].find((s) => host.endsWith(s))
  if (!suffix) return VITE_APP_NAME // dominio raíz, localhost, IPs, otros

  const slug = host.slice(0, -suffix.length).split('.').pop() ?? ''
  if (!slug || RESERVED.has(slug)) return VITE_APP_NAME

  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export function setupTenantManifest(): void {
  const { origin } = location
  const name = getTenantName()

  const manifest = {
    id: `${origin}/`,
    name,
    short_name: name,
    start_url: `${origin}/`,
    scope: `${origin}/`,
    display: 'standalone',
    theme_color: '#d68a5e',
    background_color: '#ffffff',
    icons: [
      { src: `${origin}/icons/pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${origin}/icons/pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${origin}/icons/pwa-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' })

  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'manifest'
    document.head.appendChild(link)
  }
  link.href = URL.createObjectURL(blob)
}