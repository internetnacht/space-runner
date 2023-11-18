import { GLOBAL_ASSET_KEYS, filePaths } from '../../constants'

export function computeScrollFactor(fixed: boolean): number {
	return fixed ? 0 : 1
}

export function loadButtonAssets(loader: Phaser.Loader.LoaderPlugin) {
	loader.image(GLOBAL_ASSET_KEYS.images.toggler.on, filePaths.images.buttons.toggle.on)
	loader.image(GLOBAL_ASSET_KEYS.images.toggler.off, filePaths.images.buttons.toggle.off)
}
