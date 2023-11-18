import { ButtonClickConfig } from "./ButtonClickConfig"
import { ButtonConfig } from "./ButtonConfig"

export interface ToggleButtonConfig extends ButtonConfig, Partial<ButtonClickConfig> {
	initialState: boolean
	stateChangeCallback: (state: boolean) => void
}