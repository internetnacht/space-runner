import { access, readFile, readdir, writeFile } from 'fs/promises'

export async function generateWorldIds() {
	const mapsDirContent = await readdir('assets/maps', { withFileTypes: true })
	const levelList = mapsDirContent.filter((ent) => ent.isDirectory()).map((dir) => dir.name)

	try {
		await access('.env')
	} catch {
		await writeFile('.env', '')
	}

	const currentEnvContent = await readFile('.env', { encoding: 'utf-8' })

	const newEnvContent = (() => {
		if (/^VITE_LEVELS/.test(currentEnvContent)) {
			return currentEnvContent.replace(
				/^VITE_LEVELS=.*/,
				`VITE_LEVELS=${JSON.stringify(levelList)}`
			)
		} else {
			return (
				currentEnvContent +
				`${currentEnvContent.length == 0 ? '' : '\n\n'}VITE_LEVELS=${JSON.stringify(
					levelList
				)}`
			)
		}
	})()

	writeFile('.env', newEnvContent)
}
