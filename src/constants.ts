import { Platform } from './components/map-components/Platform.ts'
import { ChunkId } from './global-types.ts'
import Level from './scenes/Level.ts'
import { List } from 'immutable'

export const DEBUG = true

export const MEASURES = Object.freeze({
	window: {
		width: 800,
		height: 600,
	},
	buttons: {
		click: {
			margin: {
				normal: 10,
				compact: 10,
			},
		},
		fancy: {
			click: {
				padding: {
					big: 16,
				},
				margin: 10,
			},
		},
		toggle: {
			margin: {
				normal: 10,
				compact: 5,
			},
			padding: {
				normal: 5,
				compact: 2,
			},
			text: {
				margin: 5,
			},
		},
	},
	tiles: {
		width: 16,
		height: 16,
	},
	maps: {
		layerDepthOffset: 10,
	},
	player: {
		spawn: {
			default: {
				x: 0,
				y: 0,
			},
		},
	},
})

export const filePaths = Object.freeze({
	sprites: {
		dude: 'sprites/dude.png',
		sheet: 'sprites/spritesheet.png',
		platform: (type: Platform) => 'sprites/platforms/' + type + '.png',
	},
	images: {
		background: 'images/background.png',
		buttons: {
			toggle: {
				on: 'images/button-toggle-on.png',
				off: 'images/button-toggle-off.png',
			},
		},
		startingScreen: {
			background: 'images/starting-screen.jpg',
		},
	},
	maps: {
		master: (worldSceneKey: string) => `maps/${worldSceneKey}/master.json`,
		chunk: (worldSceneKey: string, chunk: ChunkId) =>
			`maps/${worldSceneKey}/chunk${chunk}.json`,
	},
	audio: {
		'audio-background': 'audio/at+the+wheel.mp3',
		'audio-starting-screen': 'audio/Unlimited+power.mp3',
		'audio-died': 'audio/Black+&+White.mp3',
		'audio-finished': 'audio/Morning.mp3',
	},
})

export const SCENE_ASSET_KEYS = Object.freeze({
	maps: {
		tileset: (sceneKey: string) => sceneKey + '_tiles',
		master: (sceneKey: string) => sceneKey + '_master',
		chunk: (sceneKey: string, chunkId: ChunkId) => sceneKey + '_chunk_' + chunkId,
		chunkJSON: (sceneKey: string, chunkId: ChunkId) => sceneKey + '_chunkjson_' + chunkId,
		platform: (platform: Platform) => 'sprite_platform_' + platform,
	},
	images: {
		background: (sceneKey: string) => sceneKey + '_backgroundImageKey',
	},
	animations: {
		character: {
			moving: {
				left: (characterType: string) => `character-${characterType}-left`,
				right: (characterType: string) => `character-${characterType}-right`,
				turn: (characterType: string) => `character-${characterType}-turn`,
				jumping: {
					left: (characterType: string) => `character-${characterType}-jumping-left`,
					right: (characterType: string) => `character-${characterType}-jumping-right`,
				},
			},
		},
	},
})

export const GLOBAL_ASSET_KEYS = Object.freeze({
	images: {
		background: 'background_image_key',
		toggler: {
			on: 'toggle-button-on',
			off: 'toggle-button-off',
		},
		startingScreen: {
			background: 'starting-screen-background-image',
		},
	},
})

export const TILED_CUSTOM_CONSTANTS = Object.freeze({
	layers: {
		spawn: {
			name: 'Player',
		},
		properties: {
			collide: {
				name: 'collide',
			},
			kill: {
				name: 'kill',
			},
			finish: {
				name: 'finish',
			},
		},
	},
})

export const PHASER_FILE_TYPE_TO_LOADER = Object.freeze({
	audio: 'audio',
	tilemapJSON: 'tilemapTiledJSON',
	json: 'json',
})

export type PHASER_FILE_TYPES = keyof typeof PHASER_FILE_TYPE_TO_LOADER

const levelList = JSON.parse(import.meta.env.VITE_LEVELS) as string[]
export const levels = List(levelList.map((level) => new Level(level)))

export const TILED_TILESET_NAME = 'spritesheet'
