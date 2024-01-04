import { MEASURES } from '../../constants'
import { Point } from './Point'
import { TilePoint } from './TilePoint'

export class PixelPoint extends Point {
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

	public toTileCoordinates(): TilePoint {
		return new TilePoint(
			Math.floor(this.x / MEASURES.tiles.width),
			Math.floor(this.y / MEASURES.tiles.height)
		)
	}
}
