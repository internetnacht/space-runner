import { filePaths } from '../constants'

export default class Player {
	private readonly sceneKey: string
	private readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.spritesheet('dude', filePaths.sprites.dude, { frameWidth: 32, frameHeight: 48 })
	}

	public constructor(scene: Phaser.Scene, sceneKey: string, spawnPosition?: { x: number; y: number }) {
		this.sceneKey = sceneKey

		if (spawnPosition === undefined) {
			this.sprite = scene.physics.add.sprite(0, 0, 'dude')
		} else {
			this.sprite = scene.physics.add.sprite(spawnPosition.x, spawnPosition.y, 'dude')
		}

		this.sprite.setBounce(0.1)

		this.addMovementAnimations(scene)
	}

	private addMovementAnimations(scene: Phaser.Scene) {
		scene.anims.create({
			key: `${this.sceneKey}-player-left`,
			frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		})

		scene.anims.create({
			key: `${this.sceneKey}-player-jumping-left`,
			frames: [{key: 'dude', frame: 1}],
			frameRate: 20
		})

		scene.anims.create({
			key: `${this.sceneKey}-player-jumping-right`,
			frames: [{key: 'dude', frame: 6}],
			frameRate: 20
		})

		scene.anims.create({
			key: `${this.sceneKey}-player-turn`,
			frames: [{ key: 'dude', frame: 4 }],
			frameRate: 20,
		})

		scene.anims.create({
			key: `${this.sceneKey}-player-right`,
			frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		})
	}

	public update(scene: Phaser.Scene) {
		this.move(scene)
	}

	private move(scene: Phaser.Scene) {
		const keyboard = scene.input.keyboard
		if (keyboard === null) {
			throw 'keyboard plugin is null'
		}
		const cursors = keyboard.createCursorKeys()

		if (cursors.left.isDown) {
			this.moveSideWays(-160, 'left')
		} else if (cursors.right.isDown) {
			this.moveSideWays(160, 'right')
		} else {
			this.moveSideWays(0, 'turn')
		}

		if (cursors.up.isDown) {
			if (this.sprite.body.onFloor()) {
				this.sprite.setVelocityY(-350)
			} else {
				const currentVelocity = this.sprite.body.velocity.y
				if (currentVelocity < 0) {
					this.sprite.setVelocityY(currentVelocity - 6)
				}
			}
		}
	}

	private moveSideWays (velocity: number, direction: string) {
		this.sprite.setVelocityX(velocity)
		if (this.sprite.body.onFloor()) {
			this.sprite.anims.play(`${this.sceneKey}-player-${direction}`, true)
		} else if (['left', 'right'].includes(direction)) {
			this.sprite.anims.play(`${this.sceneKey}-player-jumping-${direction}`)
		}
	}

	public getCollider (): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
		return this.sprite
	}

	public attachToCamera(camera: Phaser.Cameras.Scene2D.Camera) {
		camera.startFollow(this.sprite)
	}

	public shutdown () {}

	public setDisplayDepth (depth: number): void {
		this.sprite.setDepth(depth)
	}

	public getX (): number {
		return this.sprite.x
	}

	public getY (): number {
		return this.sprite.y
	}
}