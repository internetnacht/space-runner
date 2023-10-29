import { filePaths } from '../constants';
import GameSettings from './UserSettings';

type AudioKey = keyof typeof filePaths.audio

export default class MusicPlayer {
	private readonly scene: Phaser.Scene

	public static loadAssets (scene: Phaser.Scene) {
		scene.load.audio('audio-background', filePaths.audio['audio-background']);
	}

	public constructor (scene: Phaser.Scene, userSettings?: GameSettings) {
		this.scene = scene

		if (userSettings !== undefined) {
			this.updateToSettings(userSettings)
			userSettings.listen(this.updateToSettings.bind(this))
		}
	}

	private updateToSettings (settings: Readonly<GameSettings>): void {
		console.log(settings)
		if (settings.musicIsOn) {
			console.log('resuming')
			this.scene.sound.setMute(false)
		} else {
			console.log('pausing')
			this.scene.sound.setMute(true)
		}
	}

	public play (audio: AudioKey) {
		this.loadAudio(audio).then(() => this.playLoadedAudio(audio))
	}

	private playLoadedAudio (audio: AudioKey) {
		this.scene.sound.play(audio)
	}

	public async loadAudio (audio: AudioKey): Promise<any> {
		if (this.scene.load.cacheManager.audio.has(audio)) {
			return new Promise(resolve => resolve(null))
		}
		
		return new Promise(resolve => {
			this.scene.load.once(`filecomplete-audio-${audio}`, () => {
				resolve(null)
			});

			const loader = this.scene.load.audio(audio, filePaths.audio[audio]);
			loader.start();
		})
	}

	public pause () {
		this.scene.sound.pauseAll();
	}

	public resume () {
		this.scene.sound.resumeAll();
	}

	public shutdown () {
		this.scene.sound.removeAll()
	}
}
