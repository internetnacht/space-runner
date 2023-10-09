export default class MusicPlayer {
	private player: MusicPlayer = new MusicPlayer()

	private constructor() {}

	public getPlayer(): MusicPlayer {
		return this.player
	}
}
