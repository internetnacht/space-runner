import * as t from 'io-ts'

/**
 * types currently only check fields that are used by inacht code
 */

export const MapLayerObject = t.type({
	x: t.number,
	y: t.number,
})
export type MapLayerObjectT = t.TypeOf<typeof MapLayerObject>

export const TilemapMapLayer = t.type({
	name: t.string,
	type: t.string,
	data: t.string,
})
export type TilemapMapLayerT = t.TypeOf<typeof TilemapMapLayer>

export const ObjectMapLayer = t.type({
	name: t.string,
	type: t.string,
	objects: t.array(MapLayerObject),
})
export type ObjectMapLayerT = t.TypeOf<typeof ObjectMapLayer>

export const MapMaster = t.type({
	mapWidth: t.number,
	tileWidth: t.number,
	tileHeight: t.number,
	horizontalChunkAmount: t.number,
	verticalChunkAmount: t.number,
	globalLayers: t.array(ObjectMapLayer),
	chunkWidth: t.number,
	chunkHeight: t.number,
})
export type MapMasterT = t.TypeOf<typeof MapMaster>

export const MapChunk = t.type({
	width: t.number,
	height: t.number,
	layers: t.array(TilemapMapLayer),
})
export type MapChunkT = t.TypeOf<typeof MapChunk>
