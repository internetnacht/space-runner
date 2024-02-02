import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { getFirestore, doc, collection, getDocs, setDoc } from 'firebase/firestore'

import { TaskId, TaskUnlocker } from './TaskUnlocker'
import { InternalGameError } from '../errors/InternalGameError'

interface Task {
	id: string
	unlocked: boolean
	[key: string]: unknown
}

export class FirebaseTaskUnlocker implements TaskUnlocker {
	private static _instance: FirebaseTaskUnlocker | null = null
	private readonly alreadyUnlocked: string[] = []

	private readonly tasks: Task[]

	public static get instance(): FirebaseTaskUnlocker {
		if (this._instance === null) {
			throw new InternalGameError(
				'tried to access firebase task unlocker before initialising it'
			)
		}
		return this._instance
	}

	public static async setup(): Promise<void> {
		if (this._instance !== null) {
			throw new InternalGameError(
				'tried to initialise already initialised firebase task unlocker'
			)
		}

		const config = {
			apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
			storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
			appId: import.meta.env.VITE_FIREBASE_APP_ID,
			measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
		}

		const token = await this.getToken()
		initializeApp(config)
		const auth = getAuth()
		await signInWithCustomToken(auth, token)

		const tasks = await this.getAllTasks()

		const unlocker = new FirebaseTaskUnlocker(tasks)

		this._instance = unlocker
	}

	private static async getToken(): Promise<string> {
		let sendPing = false
		const pingLoop = window.setInterval(() => {
			if (sendPing) {
				parent.postMessage('ready!', '*')
				console.log('game sent ready message')
			}
		}, 500)

		return new Promise((resolve) => {
			if (window.addEventListener) {
				window.addEventListener(
					'message',
					(event) => {
						window.clearInterval(pingLoop)
						console.log('game got token message')
						//if (event.origin !== "https://internetnacht.net/spielfeld") return
						const tokenMessage = JSON.parse(event.data)
						resolve(String(tokenMessage.data))
					},
					false
				)
			} else {
				console.log('window.attachEvent')
				//@ts-ignore
				window.attachEvent('onmessage', (event) => {
					window.clearInterval(pingLoop)
					console.log('game got token message')
					//if (event.origin !== "https://internetnacht.net/spielfeld") return
					const tokenMessage = JSON.parse(event.data)
					resolve(String(tokenMessage.data))
				})
			}
			sendPing = true
		})
	}

	public static isSetup(): boolean {
		return this._instance !== null
	}

	private static async getAllTasks() {
		// fetch alle aufgaben
		const db = getFirestore()
		const aufgabenRef = collection(db, 'aufgaben')
		const aufgabenSnapshot = await getDocs(aufgabenRef)

		const tasks: Task[] = []
		aufgabenSnapshot.forEach((doc) => {
			tasks.push({ id: doc.id, ...doc.data(), unlocked: false })
		})

		// fetch unlocked aufgaben (stored at the user document)
		const unlockedAufgabenRef = collection(
			db,
			'users',
			FirebaseTaskUnlocker.getUid(),
			'freigeschalteteAufgaben'
		)
		const unlockedAufgabenSnapshot = await getDocs(unlockedAufgabenRef)
		unlockedAufgabenSnapshot.forEach((doc) => {
			const t = tasks.find((aufgabe) => aufgabe.id === doc.id)
			if (t === undefined) {
				console.error(`unlocked task ${doc.id} not found in task list`)
				return
			}
			t.unlocked = true
		})

		return tasks
	}

	private static getUid(): string {
		const user = getAuth().currentUser
		if (user === null) {
			throw new InternalGameError(`couldnt get signed in user`)
		}
		return user.uid
	}

	private constructor(tasks: any[]) {
		this.tasks = tasks
	}

	public async unlock(id: TaskId): Promise<boolean> {
		if (await this.isUnlocked(id)) {
			return false
		}
		const task = this.tasks.find((task) => String(task.number) === id)
		if (task === undefined) {
			console.warn(`couldn't find task with id ${id}`)
			return false
		}

		this.onUnlock(task.id)

		return true
	}

	public async isUnlocked(id: TaskId): Promise<boolean> {
		await this.updateTasks()

		return this.tasks.find((task) => task.id === id)?.unlocked || false
	}

	private async updateTasks() {
		const db = getFirestore()

		// fetch unlocked aufgaben (stored at the user document)
		const unlockedAufgabenRef = collection(
			db,
			'users',
			FirebaseTaskUnlocker.getUid(),
			'freigeschalteteAufgaben'
		)
		const unlockedAufgabenSnapshot = await getDocs(unlockedAufgabenRef)
		unlockedAufgabenSnapshot.forEach((doc) => {
			const t = this.tasks.find((aufgabe) => aufgabe.id === doc.id)
			if (t === undefined) {
				console.error(`unlocked task ${doc.id} not found in task list`)
				return
			}
			t.unlocked = true
		})
	}

	private async onUnlock(aufgabeID: string) {
		const t = this.tasks.find((aufgabe) => aufgabe.id === aufgabeID)
		if (t === undefined) {
			console.error(`couldn't find task ${aufgabeID} that's supposed to be unlocked`)
			return
		}

		if (this.alreadyUnlocked.includes(t.id)) {
			return
		}

		// adding a document with the corresponding aufgabeID to the user document
		const db = getFirestore()
		const unlockedAufgabenRef = doc(
			db,
			'users',
			FirebaseTaskUnlocker.getUid(),
			'freigeschalteteAufgaben',
			aufgabeID
		)
		await setDoc(
			unlockedAufgabenRef,
			{ createdTimestamp: new Date(), createdUserID: FirebaseTaskUnlocker.getUid() },
			{ merge: true }
		).catch((error) => {
			console.error('Error adding document: ', error)
		})
		// update local unlocked status

		t.unlocked = true
		this.alreadyUnlocked.push(t.id)
	}

	// private async onLock (aufgabeID: string) {
	// 	// removing a document with the corresponding aufgabeID to the user document
	// 	const db = getFirestore()
	// 	const unlockedAufgabenRef = doc(db, "users", FirebaseTaskUnlocker.getUid(), "freigeschalteteAufgaben", aufgabeID)
	// 	await deleteDoc(unlockedAufgabenRef)
	// 	  .catch((error) => {
	// 		console.error("Error removing document: ", error)
	// 	  })

	// 	// update local unlocked status
	// 	this.tasks.find((aufgabe) => aufgabe.id === aufgabeID).unlocked = false
	//   }
}
