import { GameCharacter } from './GameCharacter'

export default class Player extends GameCharacter {
	public constructor(scene: Phaser.Scene, spawnPosition?: { x: number; y: number }) {
		super(scene, spawnPosition, 'dude')

		this.setController({
			act: this.move.bind(this),
		})
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

	private moveSideWays(velocity: number, direction: string) {
		this.sprite.setVelocityX(velocity)
		if (this.sprite.body.onFloor()) {
			this.sprite.anims.play(`character-${this.type}-${direction}`, true)
		} else if (['left', 'right'].includes(direction)) {
			this.sprite.anims.play(`character-${this.type}-jumping-${direction}`)
		}
	}
}
