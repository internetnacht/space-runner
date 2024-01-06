import { PHASER_FILE_TYPES } from './constants'

export interface Asset {
	key: string
	type: PHASER_FILE_TYPES
	filePath: string
}
