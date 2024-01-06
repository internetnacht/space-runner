import { Point } from '../utils/points/Point'
import { InternalGameError } from './InternalGameError'

export class ChunkOutOfMapError extends InternalGameError {
	public constructor(point: Point) {
		super(`chunk at (${point.x}, ${point.y}) out of map`)
	}
}
