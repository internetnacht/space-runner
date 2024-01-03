import { List } from 'immutable'
import { Point } from '../Point'

export class MovementPathPoint {
	private _next: MovementPathPoint
	public readonly point: Point

	// that's as declarative and clean as a circular linked list creation will get
	// mutable variable could be made constant but this would make this function O(n^2) instead of O(n)
	public static constructCircularLinkedList(points: List<Point>): MovementPathPoint {
		const startPoint = points.first()
		if (startPoint === undefined) {
			throw 'point list must be non-empty'
		}

		const start = new MovementPathPoint(startPoint)
		const tail = points.shift()
		let current: MovementPathPoint | undefined = undefined
		for (const p of tail) {
			const nextPathPoint = new MovementPathPoint(p, start)
			if (current === undefined) {
				start._next = nextPathPoint
			} else {
				current._next = nextPathPoint
			}
			current = nextPathPoint
		}

		return start
	}

	private constructor(point: Point, next?: MovementPathPoint) {
		this.point = point
		if (next !== undefined) {
			this._next = next
		} else {
			this._next = this
		}
	}

	public get next(): MovementPathPoint {
		return this._next
	}
}
