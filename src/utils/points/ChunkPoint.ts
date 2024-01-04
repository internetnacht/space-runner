import { Point } from './Point'
import { TilePoint } from './TilePoint'

export class ChunkPoint extends Point {
	public equals(p: Point): boolean {
		return this.x === p.x && this.y === p.y
	}

	public toLeft(): ChunkPoint {
		return new ChunkPoint(this.x - 1, this.y)
	}

	public toRight(): ChunkPoint {
		return new ChunkPoint(this.x + 1, this.y)
	}

	public toTop(): ChunkPoint {
		return new ChunkPoint(this.x, this.y - 1)
	}

	public toBottom(): ChunkPoint {
		return new ChunkPoint(this.x, this.y + 1)
	}

	public toTilePoint(defaultChunkWidth: number, defaultChunkHeight: number): TilePoint {
		return new TilePoint(this.x * defaultChunkWidth, this.y * defaultChunkHeight)
	}
}
