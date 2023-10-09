import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [],
	server: { host: '0.0.0.0', port: 8082 },
	clearScreen: false,
	publicDir: 'assets',
})
