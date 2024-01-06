import { Point } from './Point'
import { TilePoint } from './TilePoint'

export class ChunkPoint extends Point {
	/**
	 * @param x - chunk x coordinate
	 * @param y - chunk y coordinate
	 *
	 * @remark
	 * 	Chunks divide the tile map into smaller parts. For default chunk sizes see the map splitting setup script. Keep in mind that chunk sizes might vary at the right and bottom borders.
	 */
	public constructor(x: number, y: number) {
		super(x, y)
	}

	public equals(p: ChunkPoint): boolean {
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

	/**
	 * @param defaultChunkWidth - default chunk width of the map this point belongs to
	 * @param defaultChunkHeight - default chunk height of the map this point belongs to
	 *
	 * @returns TilePoint instance of the top left tile of this chunk.
	 */
	public toTilePoint(defaultChunkWidth: number, defaultChunkHeight: number): TilePoint {
		return new TilePoint(this.x * defaultChunkWidth, this.y * defaultChunkHeight)
	}
}
