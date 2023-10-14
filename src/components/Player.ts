import Phaser from 'phaser'
import { filePaths } from '../constants'

export default class Player {
	private readonly scene: Phaser.Scene
	private readonly sceneKey: string
	private readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.spritesheet('dude', filePaths.sprites.dude, { frameWidth: 32, frameHeight: 48 })
	}

	public constructor(scene: Phaser.Scene, sceneKey: string, spawnPosition?: { x: number; y: number }) {
		this.scene = scene
		this.sceneKey = sceneKey

		if (spawnPosition === undefined) {
			this.sprite = scene.physics.add.sprite(0, 0, 'dude')
		} else {
			this.sprite = scene.physics.add.sprite(spawnPosition.x, spawnPosition.y, 'dude')
		}

		this.sprite.setBounce(0.1)

		this.addMovementAnimations()
	}

	private addMovementAnimations() {
		this.scene.anims.create({
			key: `${this.sceneKey}-player-left`,
			frames: this.scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		})

		this.scene.anims.create({
			key: `${this.sceneKey}-player-jumping-left`,
			frames: [{key: 'dude', frame: 1}],
			frameRate: 20
		})

		this.scene.anims.create({
			key: `${this.sceneKey}-player-jumping-right`,
			frames: [{key: 'dude', frame: 6}],
			frameRate: 20
		})

		this.scene.anims.create({
			key: `${this.sceneKey}-player-turn`,
			frames: [{ key: 'dude', frame: 4 }],
			frameRate: 20,
		})

		this.scene.anims.create({
			key: `${this.sceneKey}-player-right`,
			frames: this.scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		})
	}

	public update() {
		this.move()
	}

	private move() {
		const keyboard = this.scene.input.keyboard
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

	public setCollideWithLayer(layer: Phaser.Types.Physics.Arcade.ArcadeColliderType) {
		this.scene.physics.add.collider(this.sprite, layer)
	}

	public attachToCamera(camera: Phaser.Cameras.Scene2D.Camera) {
		camera.startFollow(this.sprite)
	}

	public shutdown () {}
}
