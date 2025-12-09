Moon Landing — Vite + Vue 3 PWA demo

Files created under this zip are a minimal Vite project:
- package.json
- vite.config.js
- index.html
- manifest.json
- src/ (main.js, App.vue, components, composables, styles.css)
- public/icons (SVG icons)
- public/sw.js (minimal)

To run:
1. npm install
2. npm run dev

Notes:
- vite-plugin-pwa is configured in vite.config.js; in production you might want to replace the simple public/sw.js with build-time generated service worker.
