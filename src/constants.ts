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
		tilemap: (worldId: number) => `tilemaps/map${worldId}.json`
	},
	audio: {
		"audio-background": 'audio/A+Drop+In+the+Desert.mp3'
	}
})

const worldIds = List([1, 2, 3, 4, 5, 6])
export const worlds = worldIds.map((id) => new World(id))

export const LIST_BUTTON_MARGIN = 10