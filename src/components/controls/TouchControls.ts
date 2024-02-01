import { MEASURES } from '../../constants'
import { Controls } from './Controls'

export class TouchControls implements Controls {
	private left: boolean
	private right: boolean
	private top: boolean
	private bottom: boolean

	public constructor(scene: Phaser.Scene) {
		// enable to touch points at a time
		scene.input.addPointer()

		this.left = false
		this.right = false
		this.top = false
		this.bottom = false

		const margin = Math.min(MEASURES.window.width, MEASURES.window.height) * 0.02
		const areaWidth = Math.max(70, MEASURES.window.width * 0.05)
		const areaHeight = Math.max(86, MEASURES.window.height * 0.1)

		// left
		scene.add
			.rectangle(
				margin,
				MEASURES.window.height - margin - areaHeight,
				areaWidth,
				areaHeight,
				0xffffff,
				0.7
			)
			.setScrollFactor(0)
			.setDepth(1000)
			.on('pointerover', (pointer: Phaser.Input.Pointer) => (this.left = pointer.isDown))
			.on('pointerout', () => (this.left = false))
			.setInteractive({ useHandCursor: true })
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', () => (this.left = true))
			.on('pointerup', () => (this.left = false))
			.setOrigin(0)

		// right
		scene.add
			.rectangle(
				margin + areaWidth,
				MEASURES.window.height - margin - areaHeight,
				areaWidth,
				areaHeight,
				0x0,
				0.7
			)
			.setScrollFactor(0)
			.setDepth(1000)
			.on('pointerover', (pointer: Phaser.Input.Pointer) => (this.right = pointer.isDown))
			.on('pointerout', () => (this.right = false))
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', () => (this.right = true))
			.on('pointerup', () => (this.right = false))
			.setOrigin(0)

		// jump
		scene.add
			.rectangle(
				MEASURES.window.width - margin - 2 * areaWidth,
				MEASURES.window.height - margin - areaHeight,
				2 * areaWidth,
				areaHeight,
				0x0,
				0.7
			)
			.setScrollFactor(0)
			.setDepth(1000)
			.on('pointerover', (pointer: Phaser.Input.Pointer) => (this.top = pointer.isDown))
			.on('pointerout', () => (this.top = false))
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', () => (this.top = true))
			.on('pointerup', () => (this.top = false))
			.setOrigin(0)
	}

	rightDown(): boolean {
		return this.right
	}
	leftDown(): boolean {
		return this.left
	}
	upDown(): boolean {
		return this.top
	}
	bottomDown(): boolean {
		return this.bottom
	}
}
