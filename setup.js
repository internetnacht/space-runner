import { mapWorldTasks } from './setup/level-task-mapper.js'
import { splitMaps } from './setup/map-splitter.js'
import { generateWorldIds } from './setup/world-id-generator.js'

import dotenv from 'dotenv'

main()

async function main() {
	dotenv.config()

	await splitMaps()
	await generateWorldIds()
	await mapWorldTasks()
}
