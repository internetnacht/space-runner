/**
 * Class representing a point, consisting of two coordinates.
 */
export abstract class Point {
	public readonly x: number
	public readonly y: number

	protected constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	/**
	 * @param p - the other point to compare to
	 *
	 * @returns Whether both points have the same coordinates.
	 */
	public abstract equals(p: Point): boolean

	/**
	 * @returns New instance representing the next point to the left.
	 */
	public abstract toLeft(): Point

	/**
	 * @returns New instance representing the next point to the right.
	 */
	public abstract toRight(): Point

	/**
	 * @returns New instance representing the next point to the top.
	 */
	public abstract toTop(): Point

	/**
	 * @returns New instance representing the next point to the bottom.
	 */
	public abstract toBottom(): Point
}
