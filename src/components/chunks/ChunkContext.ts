import { List } from 'immutable'
import { Player } from '../characters/Player'
import { GameCharacter } from '../characters/GameCharacter'
import { ObjectMapLayerT } from '../../tiled-types'

export interface ChunkContext {
	readonly scene: Phaser.Scene
	readonly player: Player
	readonly npcs: List<GameCharacter>
	readonly worldSceneKey: string
	readonly globalLayers: ObjectMapLayerT[]
}
