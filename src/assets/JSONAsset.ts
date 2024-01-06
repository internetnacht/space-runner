import { Asset } from './Asset'

export class JSONAsset extends Asset {
	/**
	 * @param key - see {@link Asset.Asset.key}
	 * @param filePath - see {@link Asset.Asset.filePath}
	 */
	public constructor(key: string, filePath: string) {
		super({
			key,
			filePath,
			type: 'json',
		})
	}

	public isLoaded(scene: Phaser.Scene): boolean {
		return scene.cache.json.has(this.key)
	}
	protected assetTypeSpecificLoad(scene: Phaser.Scene): void {
		scene.load.json(this.key, this.filePath)
	}
}
