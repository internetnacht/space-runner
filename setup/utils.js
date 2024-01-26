import { readdir, access, stat } from 'fs/promises'
import { dirname, basename, join } from 'path'

export async function mapFileChanged(path) {
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

export function getBaseFilename(fileName) {
	if (fileName.includes('.json')) {
		return basename(fileName, '.json')
	} else if (fileName.includes('.tmj')) {
		return basename(fileName, '.tmj')
	} else {
		throw 'unexpected file extension in filename ' + fileName
	}
}
