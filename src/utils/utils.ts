import { Props, TypeC } from 'io-ts'
import { isLeft } from 'fp-ts/lib/Either'
import { TilemapEntityProperty, TilemapEntityPropertyT } from '../tiled-types'

export function typecheck<P extends Props>(obj: unknown, type: TypeC<P>) {
	const decoded = type.decode(obj)

	if (isLeft(decoded)) {
		console.error(obj)
		throw 'obj doesnt suit type'
	}

	return decoded.right
}

export function getLayerBoolProperty(layer: Phaser.Tilemaps.LayerData, propName: string): boolean {
	return (
		getLayerProperty(layer, propName)
			.filter((prop) => prop.type === 'bool')
			.filter((prop) => prop.value === true).length > 0
	)
}

function getLayerProperty(
	layer: Phaser.Tilemaps.LayerData,
	propName: string
): TilemapEntityPropertyT[] {
	return layer.properties
		.map((prop: any) => typecheck(prop, TilemapEntityProperty))
		.filter((prop) => prop.name.toLowerCase() === propName.toLowerCase())
}

export function getLayerStringProperty(
	layer: Phaser.Tilemaps.LayerData,
	propName: string
): string[] {
	return getLayerProperty(layer, propName)
		.filter((prop) => prop.type === 'string')
		.map((prop) => prop.value)
		.filter((v) => typeof v === 'string') as string[]
}
