export abstract class Point {
	public readonly x: number
	public readonly y: number

	public constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	public equals(p: Point): boolean {
		return this.x === p.x && this.y === p.y
	}

	public abstract toLeft(): Point

	public abstract toRight(): Point

	public abstract toTop(): Point

	public abstract toBottom(): Point
}
