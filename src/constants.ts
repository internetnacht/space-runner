import World from './scenes/World.ts'
import { List } from 'immutable'

export const windowWidth = 800
export const windowHeight = 600

const worldIds = List([1, 2, 3, 4, 5, 6])

export const worlds = worldIds.map((id) => new World(`World${id}`, `map${id}`))
