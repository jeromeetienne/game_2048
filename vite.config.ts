import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	root: 'web',
	base: './',
	publicDir: 'images/icons',
	server: {
		port: process.env.PORT ? Number(process.env.PORT) : 5173,
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
	plugins: [
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: false,
			includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
			manifest: {
				name: '2048',
				short_name: '2048',
				description: 'Classic 2048 game. Join the tiles, get to 2048!',
				lang: 'en',
				theme_color: '#faf8ef',
				background_color: '#faf8ef',
				display: 'standalone',
				orientation: 'portrait',
				start_url: './',
				scope: './',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'pwa-maskable-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
			},
		}),
	],
});
