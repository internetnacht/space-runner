import MusicPlayer from '../components/MusicPlayer.ts'
import GameSettings from '../components/GameSettings.ts'
import ClickButton from '../components/buttons/ClickButton.ts'
import { MEASURES, worlds } from '../constants.ts'

export default class WorldSelectionMenu extends Phaser.Scene {
	private userSettings?: GameSettings
	private musicPlayer?: MusicPlayer

	public constructor() {
		super({
			key: 'WorldSelectionMenu',
		})
	}

	public init(data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		} else {
			throw 'expected usersettings but got ' + data.userSettings
		}

		if (data.musicPlayer instanceof MusicPlayer) {
			this.musicPlayer = data.musicPlayer
		}
	}

	public create() {
		const buttons = ClickButton.createVerticalButtonList({
			scene: this,
			x: MEASURES.buttons.click.margin.normal,
			initialY: 0,
			margin: MEASURES.buttons.click.margin.normal,
			buttons: worlds
				.map((world) => world.getSceneKey())
				.map((worldKey) => {
					return {
						label: worldKey,
						cb: () => {
							this.scene.start(worldKey, {
								userSettings: this.userSettings?.clone(),
							})
						},
					}
				}),
		})

		buttons.forEach((button) => button.display())

		this.events.on('shutdown', () => {
			this.musicPlayer?.shutdown()
		})
	}
}
