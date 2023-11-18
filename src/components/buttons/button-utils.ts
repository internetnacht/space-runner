import { filePaths } from "../../constants"

export function computeScrollFactor (fixed: boolean): number {
	return fixed ? 0 : 1
}

export function loadButtonAssets (loader: Phaser.Loader.LoaderPlugin) {
	loader.image('toggle-button-on', filePaths.images.buttons.toggle.on)
	loader.image('toggle-button-off', filePaths.images.buttons.toggle.off)
}