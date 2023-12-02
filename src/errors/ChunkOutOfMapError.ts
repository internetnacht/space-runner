import { Point } from '../components/Point'

export class ChunkOutOfMapError extends Error {
	public constructor(point: Point) {
		super(`chunk at (${point.x}, ${point.y}) out of map`)
	}
}
