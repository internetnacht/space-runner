import { List } from 'immutable'
import { Player } from '../characters/Player'
import { GameCharacter } from '../characters/GameCharacter'
import { ObjectMapLayerT } from '../../tiled-types'
import { TaskUnlocker } from '../../auth/TaskUnlocker'

export interface ChunkContext {
	readonly scene: Phaser.Scene
	readonly player: Player
	readonly npcs: List<GameCharacter>
	readonly worldSceneKey: string
	readonly globalLayers: ObjectMapLayerT[]
	readonly taskUnlocker: TaskUnlocker
}
