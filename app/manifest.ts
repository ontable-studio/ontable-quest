import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function manifest(): MetadataRoute.Manifest {
  const appName = env.NEXT_PUBLIC_APP_NAME;
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;

  return {
    name: `${appName} - Q&A Platform`,
    short_name: appName,
    description: `Join our community of learners and experts. Ask questions about programming, design, business, and more. Get help from people who've been there.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff5310',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['education', 'social', 'productivity'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/logo/ontable-transparent.svg',
        sizes: '947x458',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Ask Question',
        short_name: 'Ask',
        description: 'Ask a new question',
        url: '/?ask=true',
      },
      {
        name: 'Browse Questions',
        short_name: 'Browse',
        description: 'Browse recent questions',
        url: '/questions',
      },
    ],
    // screenshots: [
    //   {
    //     src: '/screenshots/desktop-1.png',
    //     sizes: '1280x720',
    //     type: 'image/png',
    //     platform: 'wide',
    //     label: `Desktop view of ${appName} homepage`,
    //   },
    //   {
    //     src: '/screenshots/mobile-1.png',
    //     sizes: '390x844',
    //     type: 'image/png',
    //     platform: 'narrow',
    //     label: `Mobile view of ${appName}`,
    //   },
    // ] as any, // Type assertion to allow custom platform values
  };
}
