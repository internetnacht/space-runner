import MusicPlayer from '../components/MusicPlayer.ts'
import GameSettings from '../components/UserSettings.ts'
import ClickButtonFactory from '../components/buttons/ClickButtonFactory.ts'
import { MEASURES, worlds } from '../constants.ts'

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
			x: MEASURES.buttons.click.margin.list,
			initialY: 0,
			margin: MEASURES.buttons.click.margin.list,
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

		this.events.on('shutdown', () => {
			musicPlayer.shutdown()
		})
	}
}
