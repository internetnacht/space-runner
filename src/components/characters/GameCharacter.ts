import { SCENE_ASSET_KEYS, filePaths } from '../../constants'
import { CollisionCause } from '../../global-types'
import { GameCharacterController } from './GameCharacterController'

type CharacterType = 'dude'

export class GameCharacter {
	protected readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	public readonly type: CharacterType
	protected controller?: GameCharacterController
	protected readonly deathCallback: (cause: CollisionCause) => void
	protected readonly finishCallback: (target: CollisionCause) => void

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.spritesheet('dude', filePaths.sprites.dude, { frameWidth: 32, frameHeight: 48 })
	}

	public constructor(
		scene: Phaser.Scene,
		spawnPosition?: { x: number; y: number },
		type: CharacterType = 'dude',
		deathCallback: (cause: CollisionCause) => void = () => {},
		finishCallback: (cause: CollisionCause) => void = () => {}
	) {
		this.type = type
		this.deathCallback = deathCallback
		this.finishCallback = finishCallback

		if (spawnPosition === undefined) {
			this.sprite = scene.physics.add.sprite(0, 0, this.type)
		} else {
			this.sprite = scene.physics.add.sprite(spawnPosition.x, spawnPosition.y, this.type)
		}

		this.sprite.setBounce(0.1)

		this.addMovementAnimations(scene)
	}

	public getBottom(): number {
		return this.sprite.body.y + this.sprite.body.height / 2
	}

	public kill(cause: CollisionCause) {
		this.deathCallback(cause)
	}

	public reachFinishLine(target: CollisionCause) {
		this.finishCallback(target)
	}

	protected setController(controller: GameCharacterController) {
		this.controller = controller
	}

	private addMovementAnimations(scene: Phaser.Scene) {
		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.left(this.type),
			frames: scene.anims.generateFrameNumbers(this.type, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.jumping.left(this.type),
			frames: [{ key: this.type, frame: 1 }],
			frameRate: 20,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.jumping.right(this.type),
			frames: [{ key: this.type, frame: 6 }],
			frameRate: 20,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.turn(this.type),
			frames: [{ key: this.type, frame: 4 }],
			frameRate: 20,
		})

		scene.anims.create({
			key: SCENE_ASSET_KEYS.animations.character.moving.right(this.type),
			frames: scene.anims.generateFrameNumbers(this.type, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		})
	}

	public update(scene: Phaser.Scene) {
		this.controller?.act(scene)
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
		this.sprite.body.setImmovable(false)
		this.sprite.body.setAllowGravity()
	}
}
