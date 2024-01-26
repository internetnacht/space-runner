import { access, readFile, readdir, writeFile } from 'fs/promises'
import { getBaseFilename, mapFileChanged } from './utils.js'
import { join } from 'path'

export async function mapWorldTasks() {
	const mapsDirContent = await readdir('assets/maps', { withFileTypes: true })
	const changedTmjFilePaths = mapsDirContent
		.filter((ent) => ent.name.endsWith('.tmj') || ent.name.endsWith('.json'))
		.map((file) => join(file.path, file.name))
		.filter(mapFileChanged)

	try {
		await access('.env')
	} catch {
		await writeFile('.env', '')
	}

	const currentTaskMap = (() => {
		if (process.env.VITE_TASK_UNLOCKERS !== undefined) {
			return JSON.parse(process.env.VITE_TASK_UNLOCKERS)
		} else {
			return []
		}
	})()

	const newTaskMap = await updateTaskMap(currentTaskMap, changedTmjFilePaths)

	const currentEnvContent = await readFile('.env', { encoding: 'utf-8' })

	const newEnvContent = (() => {
		if (/^VITE_TASK_UNLOCKERS/m.test(currentEnvContent)) {
			return currentEnvContent.replace(
				/^VITE_TASK_UNLOCKERS=.*/m,
				`VITE_TASK_UNLOCKERS=${JSON.stringify(newTaskMap)}`
			)
		} else {
			return (
				currentEnvContent +
				`${currentEnvContent.length == 0 ? '' : '\n\n'}VITE_TASK_UNLOCKERS=${JSON.stringify(
					newTaskMap
				)}`
			)
		}
	})()

	writeFile('.env', newEnvContent)
}

async function updateTaskMap(taskMap, changedTmjFilePaths) {
	for (const path of changedTmjFilePaths) {
		taskMap = removeUnlockers(taskMap, path)
		taskMap = await addUnlockers(taskMap, path)
	}

	return taskMap
}

async function addUnlockers(taskMap, path) {
	const level = getBaseFilename(path)
	taskMap.push([level, 'end', nextTaskId(taskMap)])

	const rawFileContent = await readFile(path)
	const fileContent = JSON.parse(rawFileContent)

	for (const layer of fileContent.layers) {
		if (layer.properties === undefined) {
			continue
		}

		const unlockProperty = layer.properties.find(
			(prop) => prop.name.toLowerCase() === 'unlocktask'
		)
		const isUnlocker =
			unlockProperty !== undefined && unlockProperty.type === 'bool' && unlockProperty.value

		if (isUnlocker) {
			taskMap.push([level, layer.name, nextTaskId(taskMap)])
		}
	}

	return taskMap
}

function removeUnlockers(taskMap, path) {
	const level = getBaseFilename(path)

	return taskMap.filter((map) => map[0] !== undefined && map[0] !== level)
}

function nextTaskId(taskMap) {
	let currentId = 1

	while (taskIdAlreadyTaken(taskMap, currentId)) {
		currentId++
	}

	return currentId
}

function taskIdAlreadyTaken(taskMap, id) {
	return taskMap.find((map) => map[2] !== undefined && map[2] === id) !== undefined
}
