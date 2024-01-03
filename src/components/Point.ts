import { MEASURES } from '../constants'

export class Point {
	public readonly x: number
	public readonly y: number

	public constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	public equals(p: Point): boolean {
		return this.x === p.x && this.y === p.y
	}

	public toLeft(): Point {
		return new Point(this.x - 1, this.y)
	}

	public toRight(): Point {
		return new Point(this.x, this.y - 1)
	}

	public toTileCoordinates(): Point {
		return new Point(
			Math.floor(this.x / MEASURES.tiles.width),
			Math.floor(this.y / MEASURES.tiles.height)
		)
	}
}
