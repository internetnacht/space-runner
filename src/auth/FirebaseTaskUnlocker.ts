import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { getFirestore, doc, collection, getDocs, setDoc } from 'firebase/firestore'

import { TaskUnlocker } from './TaskUnlocker'
import { InternalGameError } from '../errors/InternalGameError'

export class FirebaseTaskUnlocker implements TaskUnlocker {
	private static _instance: FirebaseTaskUnlocker | null = null

	private readonly tasks: any[]

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
		const token = import.meta.env.VITE_SPIELFELD_TOKEN
		initializeApp(config)
		const auth = getAuth()
		await signInWithCustomToken(auth, token)

		const tasks = await this.getAllTasks()

		const unlocker = new FirebaseTaskUnlocker(tasks)

		this._instance = unlocker
	}

	private static async getAllTasks() {
		// fetch alle aufgaben
		const db = getFirestore()
		const aufgabenRef = collection(db, 'aufgaben')
		const aufgabenSnapshot = await getDocs(aufgabenRef)

		const tasks: any[] = []
		aufgabenSnapshot.forEach((doc) => {
			tasks.push({ id: doc.id, ...doc.data(), unlocked: false })
		})

		// fetch unlocked aufgaben (stored at the user document)
		const unlockedAufgabenRef = collection(
			db,
			'users',
			this.getUid(),
			'freigeschalteteAufgaben'
		)
		const unlockedAufgabenSnapshot = await getDocs(unlockedAufgabenRef)
		unlockedAufgabenSnapshot.forEach((doc) => {
			tasks.find((aufgabe) => aufgabe.id === doc.id).unlocked = true
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

	async unlock(id: string): Promise<void> {
		this.onUnlock(id)
	}

	async isUnlocked(id: string): Promise<boolean> {
		return this.tasks.find((task) => task.id === id)?.unlocked || false
	}

	private async onUnlock(aufgabeID: string) {
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
			{ createdTimestamp: Date.now(), createdUserID: FirebaseTaskUnlocker.getUid() },
			{ merge: true }
		).catch((error) => {
			console.error('Error adding document: ', error)
		})
		// update local unlocked status
		this.tasks.find((aufgabe) => aufgabe.id === aufgabeID).unlocked = true
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
