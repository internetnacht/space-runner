import { SCENE_ASSET_KEYS, filePaths } from '../constants'

type CharacterType = 'dude'

interface CharacterController {
	act: (scene: Phaser.Scene) => void
}

export class GameCharacter {
	protected readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	protected readonly type: CharacterType
	protected controller?: CharacterController

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.spritesheet('dude', filePaths.sprites.dude, { frameWidth: 32, frameHeight: 48 })
	}

	public constructor(
		scene: Phaser.Scene,
		spawnPosition?: { x: number; y: number },
		type: CharacterType = 'dude'
	) {
		this.type = type

		if (spawnPosition === undefined) {
			this.sprite = scene.physics.add.sprite(0, 0, this.type)
		} else {
			this.sprite = scene.physics.add.sprite(spawnPosition.x, spawnPosition.y, this.type)
		}

		this.sprite.setBounce(0.1)

		this.addMovementAnimations(scene)
	}

	protected setController(controller: CharacterController) {
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

	public freeze() {
		this.sprite.body.setImmovable()
		this.sprite.body.setAllowGravity(false)
	}

	public unfreeze() {
		this.sprite.body.setImmovable(false)
		this.sprite.body.setAllowGravity()
	}
}
