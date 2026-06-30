import { defineConfig } from 'vite';

export default defineConfig({
	root: 'web',
	base: './',
	server: {
		port: process.env.PORT ? Number(process.env.PORT) : 5173,
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
});
