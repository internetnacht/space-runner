import { Asset } from './Asset'

export class TilemapJSONAsset extends Asset {
	/**
	 * @param key - see {@link Asset.Asset.key}
	 * @param filePath - see {@link Asset.Asset.filePath}
	 */
	public constructor(key: string, filePath: string) {
		super({
			key,
			filePath,
			type: 'tilemapJSON',
		})
	}

	public isLoaded(scene: Phaser.Scene): boolean {
		return scene.cache.tilemap.has(this.key)
	}
	protected assetTypeSpecificLoad(scene: Phaser.Scene): void {
		scene.load.tilemapTiledJSON(this.key, this.filePath)
	}
}
