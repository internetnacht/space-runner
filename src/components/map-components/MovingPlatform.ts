import { DEBUG, SCENE_ASSET_KEYS, filePaths } from '../../constants'
import { Point } from '../../global-types'
import { MovementPathPoint } from './MovementPathPoint'
import { Platform } from './Platform'

interface MovingPlatformConfig {
	type: Platform
	scene: Phaser.Scene
}

/**
 * accuracy is a big problem, therefore rather big error margins are necessary with the current implementation
 *
 * a platform tracks its current distance to the next checkpoint
 * the distance is only updated if the change is > 5 and at checkpoint switches
 * the velocity vector is calculated once at each checkpoint switch
 *
 * another idea is to check if the current distance is < e
 * and periodically update the velocity vector by using:
 * 	config.scene.time.addEvent({
 *		delay: 1000,
 *		loop: true,
 *		callback: this.updateVelocity,
 *		callbackScope: this
 *	})
 */
export class MovingPlatform {
	private nextMovementPoint: MovementPathPoint
	private currentTargetDistance: number
	private readonly body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

	public static loadAssets(loader: Phaser.Loader.LoaderPlugin) {
		loader.spritesheet(
			SCENE_ASSET_KEYS.maps.platform(Platform.std),
			filePaths.sprites.platform(Platform.std),
			{
				frameWidth: 96,
				frameHeight: 16,
			}
		)
	}

	public constructor(config: MovingPlatformConfig, initialMovementPoint: MovementPathPoint) {
		const startingPoint = initialMovementPoint.point
		this.body = config.scene.physics.add.sprite(
			startingPoint.x,
			startingPoint.y,
			SCENE_ASSET_KEYS.maps.platform(config.type)
		)
		this.body.body.setAllowGravity(false)
		this.body.body.setImmovable(true)
		this.nextMovementPoint = initialMovementPoint.next
		this.currentTargetDistance = this.computeAxisDistanceSumToNextPoint()
		this.updateVelocity()

		if (DEBUG) {
			let pointer = initialMovementPoint
			do {
				config.scene.add.rectangle(pointer.point.x, pointer.point.y, 4, 4, 0x0)
				pointer = pointer.next
			} while (pointer !== initialMovementPoint)
		}
	}

	public update() {
		const e = 5
		const oldDistance = this.currentTargetDistance
		const newDistance = this.computeAxisDistanceSumToNextPoint()
		if (Math.abs(oldDistance - newDistance) > e) {
			this.currentTargetDistance = newDistance
		}

		if (this.currentTargetDistance > oldDistance) {
			const next = this.nextMovementPoint.next
			if (next === null) {
				throw 'unexpected null movement point'
			}
			this.nextMovementPoint = next
			this.currentTargetDistance = this.computeAxisDistanceSumToNextPoint()
			this.updateVelocity()
		}
	}

	private computeAxisDistanceSumToNextPoint(): number {
		return this.computeAxisDistancesSum(this.position, this.nextMovementPoint.point)
	}

	private computeAxisDistancesSum(a: Point, b: Point) {
		const deltaX = Math.abs(a.x - b.x)
		const deltaY = Math.abs(a.y - b.y)

		return deltaX + deltaY
	}

	private get position(): Point {
		return {
			x: this.body.x,
			y: this.body.y,
		}
	}

	private updateVelocity() {
		const dx = this.nextMovementPoint.point.x - this.body.x
		const dy = this.nextMovementPoint.point.y - this.body.y

		if (dx === 0 && dy === 0) {
			return
		}

		const norm = Math.sqrt(dx ** 2 + dy ** 2) / 128
		const normedx = dx / norm
		const normedy = dy / norm

		this.body.setVelocity(normedx, normedy)
	}

	public getCollider(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
		return this.body
	}
}
