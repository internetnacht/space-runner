import { MEASURES } from '../../constants'
import { Controls } from './Controls'

export class TouchControls implements Controls {
	private left: boolean
	private right: boolean
	private top: boolean
	private bottom: boolean

	public constructor(scene: Phaser.Scene) {
		this.left = false
		this.right = false
		this.top = false
		this.bottom = false

		const margin = 32
		const areaWidth = 52
		const areaHeight = 52

		const top = scene.add
			.rectangle(
				margin + areaWidth,
				MEASURES.window.height - margin - 3 * areaHeight,
				areaWidth,
				areaHeight,
				0x0,
				0.7
			)
			.setScrollFactor(0)
			.setDepth(1000)
			.on('pointerover', (pointer: Phaser.Input.Pointer) => (this.top = pointer.isDown))
			.on('pointerout', () => (this.top = false))
			.on('pointerdown', () => (this.top = true))
			.on('pointerup', () => (this.top = false))
			.setInteractive({ useHandCursor: true })
			.setOrigin(0)

		const left = scene.add
			.rectangle(
				margin,
				MEASURES.window.height - margin - 2 * areaHeight,
				areaWidth,
				areaHeight,
				0x0,
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

		const right = scene.add
			.rectangle(
				margin + 2 * areaWidth,
				MEASURES.window.height - margin - 2 * areaHeight,
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

		const bottom = scene.add
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
			.on('pointerover', (pointer: Phaser.Input.Pointer) => (this.bottom = pointer.isDown))
			.on('pointerout', () => (this.bottom = false))
			.on('pointerdown', () => (this.bottom = true))
			.on('pointerup', () => (this.bottom = false))
			.setInteractive({ useHandCursor: true })
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
