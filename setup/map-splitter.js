import { splitMap, changeFilepaths } from 'phaser-map-splitter'
import { dirname, basename, join } from 'path'
import { writeFile, mkdir, readFile, readdir, access, stat } from 'fs/promises'

export async function splitMaps() {
	const mapDirContent = await readdir('assets/maps', { withFileTypes: true })
	const mapFilePaths = mapDirContent
		.filter((ent) => ent.isFile())
		.filter((file) => file.name.includes('.json') || file.name.includes('.tmj'))
		.map((jsonFile) => join(jsonFile.path, jsonFile.name))

	//todo unclean workaround for async filter
	const mapChangedStates = await Promise.all(mapFilePaths.map(mapFileChanged))
	const changedMapFilePaths = mapFilePaths.filter((_, index) => mapChangedStates[index])

	const proms = changedMapFilePaths.map((path) => splitMapFile(path))

	return Promise.all(proms)
}

async function mapFileChanged(path) {
	const dirName = join(dirname(path), getBaseFilename(path))

	try {
		await access(dirName)
	} catch {
		return true
	}

	const dirContents = await readdir(dirName)
	const dirFile = join(dirName, dirContents[0])
	const dirStats = await (dirFile !== undefined ? stat(dirFile) : stat(dirName))

	const fileStat = await stat(path)

	const fileEditTime = new Date(fileStat.mtime)
	const dirEditTime = new Date(dirStats.mtime)

	return fileEditTime > dirEditTime
}

function getBaseFilename(fileName) {
	if (fileName.includes('.json')) {
		return basename(fileName, '.json')
	} else if (fileName.includes('.tmj')) {
		return basename(fileName, '.tmj')
	} else {
		throw 'unexpected file extension in filename ' + fileName
	}
}

async function splitMapFile(mapFilePath) {
	console.log('splitting ' + mapFilePath)
	const oldPosition = dirname(mapFilePath)
	const fileName = basename(mapFilePath)
	const baseFileName = getBaseFilename(fileName)

	const newPosition = join(oldPosition, baseFileName)

	try {
		await access(newPosition)
	} catch {
		await mkdir(newPosition)
	}

	const rawMap = await readFile(join(oldPosition, fileName), { encoding: 'utf-8' })
	const map = JSON.parse(rawMap)

	const config = {
		map,
		chunkWidth: 64,
		chunkHeight: 32,
	}

	const { master, chunks } = await splitMap(config)
	changeFilepaths(master, oldPosition, newPosition)
	chunks.forEach((chunk) => changeFilepaths(chunk, oldPosition, newPosition))

	const fileWriteProms = [
		writeFile(join(newPosition, 'master.json'), JSON.stringify(master)),
		chunks.map((chunk) =>
			writeFile(join(newPosition, `chunk${chunk.id}.json`), JSON.stringify(chunk))
		),
	].flat(2)

	return Promise.all(fileWriteProms)
}
