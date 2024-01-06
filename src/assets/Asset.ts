import { PHASER_FILE_TYPES } from '../constants'

export interface AssetSpecifier {
	/** see {@link Asset.key} */
	readonly key: string

	/** see {@link Asset.type} */
	readonly type: PHASER_FILE_TYPES

	/** see {@link Asset.filePath} */
	readonly filePath: string
}

/**
 * abstract class for asset management, most importantly file loading
 *
 * @remark
 * 	dynamically accessing asset type specific loaders breaks some stuff
 * 	with this-references therefore a subclass for each file type are probably needed
 */
export abstract class Asset {
	protected readonly spec: AssetSpecifier

	protected constructor(spec: AssetSpecifier) {
		this.spec = spec
	}

	/**
	 * the key that is used to identify this asset
	 */
	get key(): string {
		return this.spec.key
	}

	/**
	 * the type of this asset, like "audio" or "json"
	 */
	get type(): PHASER_FILE_TYPES {
		return this.spec.type
	}

	/**
	 * the file path of this asset's file
	 */
	get filePath(): string {
		return this.spec.filePath
	}

	/**
	 * @param scene - the scene that will load the asset
	 *
	 * @returns a promise that will resolve, once the asset is loaded, to the asset's specifier
	 */
	public async load(scene: Phaser.Scene): Promise<AssetSpecifier> {
		if (this.isLoaded(scene)) {
			return Promise.resolve(this.spec)
		}

		const p = new Promise<AssetSpecifier>((resolve) => {
			scene.load.on(`filecomplete-${this.type}-${this.key}`, () => {
				resolve(this.spec)
			})
		})

		this.assetTypeSpecificLoad(scene)
		scene.load.start()

		return p
	}

	/**
	 * Checks if scene already loaded this asset
	 *
	 * @param scene - the scene that might contain this asset
	 *
	 * @returns whether this asset is already loaded in scene
	 */
	public abstract isLoaded(scene: Phaser.Scene): boolean

	protected abstract assetTypeSpecificLoad(scene: Phaser.Scene): void
}
