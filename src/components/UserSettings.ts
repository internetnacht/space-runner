export default class UserSettings {
	public musicIsOn: boolean

	public constructor (musicIsOn: boolean) {
		this.musicIsOn = musicIsOn
	}

	public static default (): UserSettings {
		return new UserSettings(true)
	}
}