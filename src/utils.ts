export function layerGetBoolProperty(layer: Phaser.Tilemaps.TilemapLayer, propName: string) {
	const properties = layer.layer.properties
	return (
		properties.findIndex(function (prop: any) {
			return prop.name === propName && prop.value === true
		}) !== -1
	)
}