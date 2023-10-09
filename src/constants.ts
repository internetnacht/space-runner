import World from './scenes/World.ts'
import { List } from 'immutable'

export const windowWidth = 800
export const windowHeight = 600

export const filePaths = Object.freeze({
	sprites: {
		dude: 'sprites/dude.png',
		sheet: 'sprites/spritesheet.png'
	},
	images: {
		background: 'images/background.png'
	},
	maps: {
		tilemap: (mapKey: string) => `tilemaps/${mapKey}.json`
	}
})

const worldIds = List([1, 2, 3, 4, 5, 6])

export const worlds = worldIds.map((id) => new World(`World${id}`, `map${id}`))
