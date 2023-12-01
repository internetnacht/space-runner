import { splitMaps } from './setup/map-splitter.js'
import { generateWorldIds } from './setup/world-id-generator.js'

main()

async function main() {
	await splitMaps()
	generateWorldIds()
}
