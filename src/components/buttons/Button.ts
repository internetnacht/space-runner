export default interface Button {
	get x(): number
	set x(x: number)
	get y(): number
	set y(y: number)
	getWidth(): number
	getHeight(): number
	getBottom(): number
	destruct(): void
	display(): void
	center(): void
}
