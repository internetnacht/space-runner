export type TaskId = string

export interface TaskUnlocker {
	/**
	 * Unlocks the tasks that has the given id
	 *
	 * @param id - id of the task that will be unlocked
	 *
	 * @returns void promise
	 *
	 * @throws various errors
	 */
	unlock(id: TaskId): Promise<void>

	/**
	 * Returns whether the task with the given id is already unlocked.
	 *
	 * @param id - id of the task that will be checked
	 *
	 * @returns boolean promise
	 *
	 * @throws various errors
	 */
	isUnlocked(id: TaskId): Promise<boolean>
}
