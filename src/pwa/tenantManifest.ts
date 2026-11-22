
const VITE_APP_URL = import.meta.env.VITE_APP_URL;
const VITE_APP_NAME = import.meta.env.VITE_APP_NAME;

const RESERVED = new Set(['www', 'app', 'api', 'admin']);

function getTenantName(): string {
  const host = location.hostname.toLowerCase();

  // Normalizar dominio base, con o sin protocolo
  let baseHost = '';

  try {
    const normalizedUrl = VITE_APP_URL.includes('://')
      ? VITE_APP_URL
      : `https://${VITE_APP_URL}`;

    baseHost = new URL(normalizedUrl).hostname.toLowerCase();
  } catch {
    return VITE_APP_NAME;
  }

  let slug = '';

  // PRODUCCIÓN: nikfort.juanjosepau.dev
  const suffix = `.${baseHost}`;

  if (host.endsWith(suffix)) {
    slug = host.slice(0, -suffix.length).split('.').pop() ?? '';
  }
  // DESARROLLO: nikfort.localhost
  else if (host.endsWith('.localhost')) {
    slug = host.slice(0, -'.localhost'.length).split('.').pop() ?? '';
  } else {
    // Dominio raíz, localhost, IP u otro dominio
    return VITE_APP_NAME;
  }

  if (!slug || RESERVED.has(slug)) {
    return VITE_APP_NAME;
  }

  // Convertir client-nik en Client Nik
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function setupTenantManifest(): void {
  const { origin } = location;
  const name = getTenantName();

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
      {
        src: `${origin}/icons/pwa-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${origin}/icons/pwa-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: `${origin}/icons/pwa-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  const blob = new Blob([JSON.stringify(manifest)], {
    type: 'application/manifest+json',
  });

  let link = document.querySelector<HTMLLinkElement>(
    'link[rel="manifest"]'
  );

  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }

  link.href = URL.createObjectURL(blob);
}
