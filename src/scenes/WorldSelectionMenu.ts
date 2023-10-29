import MusicPlayer from '../components/MusicPlayer.ts'
import GameSettings from '../components/UserSettings.ts'
import ClickButtonFactory from '../components/buttons/ClickButtonFactory.ts'
import { LIST_BUTTON_MARGIN, worlds } from '../constants.ts'

export default class WorldSelectionMenu extends Phaser.Scene {
	private userSettings?: GameSettings
	
	public constructor() {
		super({
			key: 'WorldSelectionMenu',
		})

	}

	public init (data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		} else {
			throw 'expected usersettings but got ' + data.userSettings
		}
	}

	public create() {
		const musicPlayer = new MusicPlayer(this, this.userSettings)
		musicPlayer.loop('audio-starting-screen')

		const buttons = ClickButtonFactory.createListFromConfig({
			scene: this,
			x: LIST_BUTTON_MARGIN,
			initialY: 0,
			margin: LIST_BUTTON_MARGIN,
			buttons: worlds
				.map(world => world.getSceneKey())
				.map(worldKey => {
					return {
						label: worldKey,
						cb: () => {
							this.scene.start(worldKey, {
								userSettings: this.userSettings?.clone()
							})
						}
					}
				})
		})
		
		buttons.forEach(button => button.display())
	}
}
