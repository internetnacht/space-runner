import { List } from 'immutable'
import { Button } from './Button'
import { MEASURES } from '../../constants'
import { FancyClickButton } from './FancyClickButton'
import { InternalGameError } from '../../errors/InternalGameError'

export class ButtonList<T extends Button> {
	private readonly buttons: List<T>
	private readonly up?: FancyClickButton
	private readonly down?: FancyClickButton

	public constructor(scene: Phaser.Scene, buttons: List<T>) {
		this.buttons = buttons

		const first = buttons.first()
		const last = buttons.last()
		if (first === undefined || last === undefined) {
			return
		}

		if (first.y < 0 || last.bottom >= MEASURES.window.height) {
			const moveStep = MEASURES.window.height / 2

			const rightBorder = last.x + last.width
			const bottomBorder = last.bottom

			const down = new FancyClickButton(scene, {
				x: rightBorder,
				y: Math.min(Math.max(bottomBorder, 0), MEASURES.window.height),
				label: 'runter',
				clickCallback: () => this.moveDown(moveStep),
				idleFillColor: 0xff0000,
				hoverFillColor: 0x0000ff,
				fixed: true,
			})
			down.depth = 10000
			down.x -= down.width
			down.y -= down.height

			const up = new FancyClickButton(scene, {
				x: rightBorder,
				y: Math.min(Math.max(bottomBorder, 0), MEASURES.window.height) - down.height,
				label: ' hoch ',
				clickCallback: () => this.moveUp(moveStep),
				idleFillColor: 0xff0000,
				hoverFillColor: 0x0000ff,
				fixed: true,
			})
			up.depth = 10000
			up.x -= up.width
			up.y -= up.height

			this.up = up
			this.down = down
		}
	}

	public moveUp(step: number): void {
		const last = this.buttons.last()
		if (last === undefined) {
			return
		}
		if (last.bottom < 0) {
			return
		}

		this.move(-step)
	}

	public moveDown(step: number): void {
		const first = this.buttons.first()
		if (first === undefined) {
			return
		}
		if (first.y > MEASURES.window.height) {
			return
		}

		this.move(step)
	}

	private move(step: number): void {
		this.buttons.forEach((b) => (b.y += step))
	}

	public display(): void {
		this.up?.display()
		this.down?.display()
		this.buttons.forEach((b) => b.display())
	}
}
