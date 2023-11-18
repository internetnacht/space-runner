import { Props, TypeC } from 'io-ts'
import { MEASURES } from './constants'
import { Asset } from './global-types'
import { isLeft } from 'fp-ts/lib/Either'

export function layerGetBoolProperty(layer: Phaser.Tilemaps.TilemapLayer, propName: string) {
	const properties = layer.layer.properties
	return (
		//phaser uses object as the type for prop but object is completely unusable -> necessary to use any here
		properties.findIndex(function (prop: any) {
			return prop.name === propName && prop.value === true
		}) !== -1
	)
}

export function loadFile(asset: Asset, loader: Phaser.Loader.LoaderPlugin, loadCb: () => void): Promise<Asset> {
	console.log('loading ' + asset.filePath)
	const p = new Promise<Asset>((resolve) => {
		loader.on(`filecomplete-${asset.type}-${asset.key}`, () => {
			resolve(asset)
		})
	})

	loadCb()
	loader.start()

	return p
}

export function computeChunkId (x: number, y: number, measures: { horizontalChunkAmount: number, chunkWidth: number, chunkHeight: number}): number {
	const tileX = Math.floor(x / MEASURES.tiles.width)
	const tileY = Math.floor(y / MEASURES.tiles.height)
	const chunkX = Math.floor(tileX / measures.chunkWidth)
	const chunkY = Math.floor(tileY / measures.chunkHeight)

	return chunkY * measures.horizontalChunkAmount + chunkX
}

export function typecheck<P extends Props> (obj: unknown, type: TypeC<P>) {
	const decoded = type.decode(obj)

	if (isLeft(decoded)) {
		console.error(obj)
		throw 'obj doesnt suit type'
	}
	
	return decoded.right
}