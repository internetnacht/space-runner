import { CollisionCause } from '../../global-types'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { Controls } from '../controls/Controls'
import { TiledMap } from '../chunks/TiledMap'
import { GameCharacter } from './GameCharacter'
import { PlayerController } from './PlayerController'

export class Player extends GameCharacter {
	private deathCount: number

	public constructor(
		scene: Phaser.Scene,
		map: TiledMap,
		controls: Controls,
		finishCallback: (cause: CollisionCause) => void,
		spawnPosition?: PixelPoint
	) {
		super(
			scene,
			map,
			controls,
			spawnPosition,
			'dude',
			(_: any) => {
				this.teleportTo(this.activeCheckpoint.toPixelPoint())
				this.deathCount++
				if (this.deathCount % 10 === 0) {
					const marker = scene.add
						.text(this.sprite.x, this.sprite.y, 'Du schaffst das!')
						.setDepth(100)
					scene.time.delayedCall(2048, () => marker.destroy())
				}
			},
			finishCallback
		)

		this.setController(new PlayerController(this.sprite, this))

		this.deathCount = 0
	}
}
