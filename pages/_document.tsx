import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0A0F" />
        <meta name="application-name" content="KiraStream" />

        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KiraStream" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* Fonts sudah dimuat lewat globals.css / tailwind, tidak diubah di sini */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
