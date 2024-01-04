import { MEASURES } from '../../constants'
import { PixelPoint } from './PixelPoint'
import { Point } from './Point'

export class TilePoint extends Point {
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

	public toPixelCoordinates(): PixelPoint {
		return new PixelPoint(this.x * MEASURES.tiles.width, this.y * MEASURES.tiles.height)
	}
}
