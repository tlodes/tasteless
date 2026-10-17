export default defineNuxtConfig({
  compatibilityDate: '2026-10-03',
  devtools: { enabled: false },
  ssr: false,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      title: 'Tasteless — Klaus Wunderbaum · Trix',
      meta: [
        {
          name: 'description',
          content: 'Tasteless präsentiert Klaus Wunderbaum – Trix. Interaktiver DJ-Controller und Audio-Player.'
        },
        { name: 'theme-color', content: '#e9e2c9' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  typescript: {
    typeCheck: true
  }
})
