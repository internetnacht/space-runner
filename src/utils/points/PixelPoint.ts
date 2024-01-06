import { MEASURES } from '../../constants'
import { Point } from './Point'
import { TilePoint } from './TilePoint'

export class PixelPoint extends Point {
	/**
	 * @param x - pixel x coordinate
	 * @param y - pixel y coordinate
	 */
	public constructor(x: number, y: number) {
		super(x, y)
	}

	public equals(p: PixelPoint): boolean {
		return this.x === p.x && this.y === p.y
	}

	public toLeft(): PixelPoint {
		return new PixelPoint(this.x - MEASURES.tiles.width, this.y)
	}

	public toRight(): PixelPoint {
		return new PixelPoint(this.x + MEASURES.tiles.width, this.y)
	}

	public toTop(): PixelPoint {
		return new PixelPoint(this.x, this.y - MEASURES.tiles.height)
	}

	public toBottom(): PixelPoint {
		return new PixelPoint(this.x, this.y + MEASURES.tiles.height)
	}

	/**
	 * @returns TilePoint instance of the tile that includes the pixel pointed to by this.
	 */
	public toTilePoint(): TilePoint {
		return new TilePoint(
			Math.floor(this.x / MEASURES.tiles.width),
			Math.floor(this.y / MEASURES.tiles.height)
		)
	}
}
