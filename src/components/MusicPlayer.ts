import { filePaths } from '../constants'
import { Asset } from '../global-types'
import { loadFile } from '../utils'
import { GameSettings } from './GameSettings'

type AudioKey = keyof typeof filePaths.audio

export class MusicPlayer {
	/**
	 * sound is played via a Phaser.Scene instance -> MusicPlayer depends on its scene
	 */
	private readonly scene: Phaser.Scene

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.audio('audio-background', filePaths.audio['audio-background'])
	}

	public constructor(scene: Phaser.Scene, userSettings?: GameSettings) {
		this.scene = scene

		if (userSettings !== undefined) {
			this.updateToSettings(userSettings)
			userSettings.listen(this.updateToSettings.bind(this))
		}
	}

	private updateToSettings(settings: Readonly<GameSettings>): void {
		if (settings.musicIsOn) {
			this.scene.sound.setMute(false)
		} else {
			this.scene.sound.setMute(true)
		}
	}

	public play(audio: AudioKey, config?: Phaser.Types.Sound.SoundConfig) {
		this.loadAudio(audio).then(() => this.playLoadedAudio(audio, config))
	}

	private playLoadedAudio(audio: AudioKey, config?: Phaser.Types.Sound.SoundConfig) {
		this.scene.sound.play(audio, config)
	}

	public loop(audio: AudioKey) {
		this.play(audio, { loop: true })
	}

	public stop(audio: AudioKey) {
		this.scene.sound.stopByKey(audio)
	}

	public async loadAudio(audio: AudioKey): Promise<Asset> {
		const asset: Asset = {
			key: audio,
			type: 'audio',
			filePath: filePaths.audio[audio],
		}

		if (this.scene.load.cacheManager.audio.has(audio)) {
			return new Promise((resolve) => resolve(asset))
		}

		return loadFile(
			asset,
			this.scene.load,
			(key) => this.scene.load.audio(key, filePaths.audio[audio]),
			(key) => this.scene.cache.audio.get(key) !== undefined
		)
	}

	public pause() {
		this.scene.sound.pauseAll()
	}

	public resume() {
		this.scene.sound.resumeAll()
	}

	public shutdown() {
		this.scene.sound.removeAll()
	}
}
