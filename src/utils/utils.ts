import { Props, TypeC } from 'io-ts'
import { isLeft } from 'fp-ts/lib/Either'
import { TilemapEntityProperty, TilemapEntityPropertyT } from '../tiled-types'
import { InternalGameError } from '../errors/InternalGameError'

/**
 * Checks if obj suits type and returns obj with type type on success or throws otherwise.
 *
 * @param obj - the object that's supposed to be of the given type
 * @param type - wanted type of obj
 *
 * @returns obj with type type.
 *
 * @throws string
 * If obj doesn't fullfill the type.
 */
export function typecheck<P extends Props>(obj: unknown, type: TypeC<P>) {
	const decoded = type.decode(obj)

	if (isLeft(decoded)) {
		console.error(obj)
		throw 'obj doesnt suit type'
	}

	return decoded.right
}

/**
 * Searches for boolean property propName in layer and returns whether its set and set to true. Ignores properties of other types.
 *
 * @param layer
 * @param propName - case sensitive property name
 *
 * @returns Whether propName is set in layer and is set to true.
 *
 * @throws {@link InternalGameError}
 * Throws if more than one identical properties are found.
 */
export function getLayerBoolProperty(layer: Phaser.Tilemaps.LayerData, propName: string): boolean {
	const foundProperties = getLayerProperty(layer, propName).filter((prop) => prop.type === 'bool')

	if (foundProperties.length === 0) {
		return false
	} else if (foundProperties.length > 1) {
		throw new InternalGameError(
			`unexpected amount of identical layer properties, got ${foundProperties.length}`
		)
	} else {
		return foundProperties[0].value === true
	}
}

/**
 * Gets all properties with name propName in layer.
 *
 * @param layer
 * @param propName - case sensitive property name
 *
 * @returns All properties with name propName set in layer.
 */
function getLayerProperty(
	layer: Phaser.Tilemaps.LayerData,
	propName: string
): TilemapEntityPropertyT[] {
	return layer.properties
		.map((prop: any) => typecheck(prop, TilemapEntityProperty))
		.filter((prop) => prop.name.toLowerCase().trim() === propName.toLowerCase().trim())
}

/**
 * Searches for string property propName in layer and returns its value or null if it's not set. Ignores properties of other types.
 *
 * @param layer
 * @param propName - case sensitive property name
 *
 * @returns The value of the property or null if it's not set.
 *
 * @throws {@link InternalGameError} Throws if more than one identical properties are found or if the property value is not a string.
 */
export function getLayerStringProperty(
	layer: Phaser.Tilemaps.LayerData,
	propName: string
): string | null {
	const foundProperties = getLayerProperty(layer, propName).filter(
		(prop) => prop.type === 'string'
	)

	if (foundProperties.length === 0) {
		return null
	} else if (foundProperties.length > 1) {
		throw new InternalGameError(
			`unexpected amount of identical layer properties, got ${foundProperties.length}`
		)
	} else {
		const foundValue = foundProperties[0].value
		if (typeof foundValue === 'boolean') {
			throw new InternalGameError(
				`unexpected value type, value of string property is boolean`
			)
		}
		return foundValue
	}
}
