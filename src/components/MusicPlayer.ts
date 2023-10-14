import { filePaths } from '../constants';

type AudioKey = keyof typeof filePaths.audio

export default class MusicPlayer {
	private readonly scene: Phaser.Scene

	public static loadAssets (scene: Phaser.Scene) {
		scene.load.audio('audio-background', filePaths.audio['audio-background']);
	}

	public constructor (scene: Phaser.Scene) {
		this.scene = scene
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
