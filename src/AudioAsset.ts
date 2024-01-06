import { Asset } from './Asset'

export class AudioAsset extends Asset {
	/**
	 * @param key - see {@link Asset.Asset.key}
	 * @param filePath - see {@link Asset.Asset.filePath}
	 */
	public constructor(key: string, filePath: string) {
		super({
			key,
			filePath,
			type: 'audio',
		})
	}

	public isLoaded(scene: Phaser.Scene): boolean {
		return scene.cache.audio.has(this.key)
	}
	protected assetTypeSpecificLoad(scene: Phaser.Scene): void {
		scene.load.audio(this.key, this.filePath)
	}
}
