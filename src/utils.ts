import { Props, TypeC } from 'io-ts'
import { Asset } from './global-types'
import { isLeft } from 'fp-ts/lib/Either'

/**
 * selecting the phaser loader by asset key doesn't work because some scope references are lost even when using .bind(this)
 * therefore redundant callbacks are necessary
 * todo maybe I just haven't found a solution yet
 */
export function loadFile(
	asset: Asset,
	loader: Phaser.Loader.LoaderPlugin,
	loadCb: (key: string) => void,
	alreadyLoadedCb: (key: string) => boolean
): Promise<Asset> {
	if (alreadyLoadedCb(asset.key)) {
		return Promise.resolve(asset)
	}

	const p = new Promise<Asset>((resolve) => {
		loader.on(`filecomplete-${asset.type}-${asset.key}`, () => {
			resolve(asset)
		})
	})

	loadCb(asset.key)
	loader.start()

	return p
}

export function typecheck<P extends Props>(obj: unknown, type: TypeC<P>) {
	const decoded = type.decode(obj)

	if (isLeft(decoded)) {
		console.error(obj)
		throw 'obj doesnt suit type'
	}

	return decoded.right
}
