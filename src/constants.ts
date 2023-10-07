import World from "./scenes/World.ts";

const windowWidth = 800
const windowHeight = 600

const worldIds: number[] = []
for (let i = 1; i <= 6; i++) {
    worldIds.push(i)
}

const worlds = worldIds.map(id => new World(`World${id}`, `map${id}`))

export {
    windowWidth,
    windowHeight,
    worlds
}