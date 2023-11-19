export default interface Button {
	get x(): number
	set x(newX: number)
	get y(): number
	set y(newY: number)
	get width(): number
	get height(): number
	get bottom(): number
	destruct(): void
	display(): void
	center(): void
}
