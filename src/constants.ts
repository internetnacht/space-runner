import World from "./scenes/World.ts";

export const windowWidth = 800
export const windowHeight = 600

const worldIds: number[] = []
for (let i = 1; i <= 6; i++) {
    worldIds.push(i)
}

export const worlds = worldIds.map(id => new World(`World${id}`, `map${id}`))