import { MEASURES } from '../../constants'
import { PixelPoint } from './PixelPoint'
import { Point } from './Point'

export class TilePoint extends Point {
	/**
	 * @param x - tile x coordinate
	 * @param y - tile y coordinate
	 *
	 * @remark
	 * 	Tiles are the unit block or 'pixel' of Tiled. For tile pixel sizes see {@link MEASURES}.
	 */
	public constructor(x: number, y: number) {
		super(x, y)
	}

	public equals(p: TilePoint): boolean {
		return this.x === p.x && this.y === p.y
	}

	public toLeft(): TilePoint {
		return new TilePoint(this.x - 1, this.y)
	}

	public toRight(): TilePoint {
		return new TilePoint(this.x + 1, this.y)
	}

	public toTop(): TilePoint {
		return new TilePoint(this.x, this.y - 1)
	}

	public toBottom(): TilePoint {
		return new TilePoint(this.x, this.y + 1)
	}

	/**
	 * @returns PixelPoint instance of top left pixel of this tile.
	 */
	public toPixelPoint(): PixelPoint {
		return new PixelPoint(this.x * MEASURES.tiles.width, this.y * MEASURES.tiles.height)
	}
}
