import { MEASURES, SCENE_ASSET_KEYS, filePaths } from '../../constants'
import { CollisionCause } from '../../global-types'
import { Checkpoint } from '../../utils/checkpoints/Checkpoint'
import { TileCheckpoint } from '../../utils/checkpoints/TileCheckpoint'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { Controls } from '../controls/Controls'
import { TiledMap } from '../chunks/TiledMap'
import { GameCharacterController } from './GameCharacterController'
import { TilePoint } from '../../utils/points/TilePoint'
import { TaskId } from '../../auth/TaskUnlocker'

type CharacterType = 'dude'

export class GameCharacter {
	protected readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	public readonly type: CharacterType
	public readonly lethal: boolean
	protected controller?: GameCharacterController
	protected readonly deathCallback: (cause: CollisionCause) => void
	protected readonly finishCallback: (target: CollisionCause, taskId: TaskId) => void
	protected activeCheckpoint: Checkpoint
	protected map: TiledMap
	protected readonly controls

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.spritesheet('dude', filePaths.sprites.stacey, {
			frameWidth: 64,
			frameHeight: 96,
		})
	}

	public constructor(
		scene: Phaser.Scene,
		map: TiledMap,
		controls: Controls,
		spawnPosition?: PixelPoint,
		type: CharacterType = 'dude',
		deathCallback: (cause: CollisionCause) => void = () => {},
		finishCallback: (cause: CollisionCause, taskId: TaskId) => void = () => {},
		lethal = false
	) {
		this.map = map
		this.type = type
		this.controls = controls
		this.deathCallback = deathCallback
		this.finishCallback = finishCallback
		this.lethal = lethal

		this.sprite = scene.physics.add.sprite(0, 0, this.type)
		if (spawnPosition !== undefined) {
			this.teleportTo(spawnPosition)
			const tileSpawn = spawnPosition.toTilePoint()
			this.activeCheckpoint = new TileCheckpoint(tileSpawn.x, tileSpawn.y)
		} else {
			this.activeCheckpoint = new TileCheckpoint(0, 0)
		}

		this.sprite.setOrigin(0)
		this.sprite.setMaxVelocity(1000)
		this.sprite.setBounce(0.1)

		this.addMovementAnimations(scene)
		this.freeze()
	}

	public getBottom(): number {
		return this.sprite.body.y + this.sprite.body.height / 2
	}

	public kill(cause: CollisionCause) {
		this.deathCallback(cause)
	}

	public reachFinishLine(target: CollisionCause, taskId: TaskId) {
		this.finishCallback(target, taskId)
	}

	protected setController(controller: GameCharacterController) {
		this.controller = controller
	}

	public teleportTo(position: PixelPoint) {
		let t = position.toTilePoint()
		while (!this.positionHasEnoughSpace(t)) {
			t = new TilePoint(t.x, t.y - 1)
		}

		this.sprite.setVelocity(0)

		const newPixelPosition = t.toPixelPoint()
		this.sprite.setPosition(newPixelPosition.x, newPixelPosition.y)
	}

	private positionHasEnoughSpace(position: TilePoint) {
		const characterWidth = this.sprite.width / MEASURES.tiles.width
		const characterHeight = this.sprite.height / MEASURES.tiles.height

		for (let i = 0; i < characterHeight; i++) {
			for (let j = 0; j < characterWidth; j++) {
				const lookedAtPosition = new TilePoint(position.x + j, position.y + i)
				if (this.map.isSolidAt(lookedAtPosition)) {
					return false
				}
			}
		}

		return true
	}

	private addMovementAnimations(scene: Phaser.Scene) {
		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.left(this.type),
			frames: scene.anims.generateFrameNumbers(this.type, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.jumping.left(this.type),
			frames: [{ key: this.type, frame: 6 }],
			frameRate: 20,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.jumping.right(this.type),
			frames: [{ key: this.type, frame: 2 }],
			frameRate: 20,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.turn(this.type),
			frames: [{ key: this.type, frame: 4 }],
			frameRate: 20,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.right(this.type),
			frames: scene.anims.generateFrameNumbers(this.type, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		})
	}

	public update(scene: Phaser.Scene, map?: TiledMap) {
		this.controller?.act(scene, this.controls, map)
	}

	public getCollider(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
		return this.sprite
	}

	public attachToCamera(camera: Phaser.Cameras.Scene2D.Camera) {
		camera.startFollow(this.sprite)
	}

	public shutdown() {}

	public setDisplayDepth(depth: number): void {
		this.sprite.setDepth(depth)
	}

	public getX(): number {
		return this.sprite.x
	}

	public getY(): number {
		return this.sprite.y
	}

	public isMovingDown(): boolean {
		return this.controller?.movesDown() ?? false
	}

	public freeze() {
		this.sprite.body.setImmovable()
		this.sprite.body.setAllowGravity(false)
	}

	public unfreeze() {
		this.teleportTo(new PixelPoint(this.getX(), this.getY()))
		this.sprite.body.setImmovable(false)
		this.sprite.body.setAllowGravity()
	}

	public isFrozen(): boolean {
		return this.sprite.body.immovable
	}

	public getPosition(): PixelPoint {
		return new PixelPoint(this.sprite.x, this.sprite.y)
	}

	set checkpoint(checkpoint: Checkpoint) {
		this.activeCheckpoint = checkpoint
	}
}
