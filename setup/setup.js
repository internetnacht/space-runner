import { splitMaps } from './map-splitter.js'
import { generateWorldIds } from './world-id-generator.js'

main()

async function main() {
	await splitMaps()
	generateWorldIds()
}
