/**
 * @file Persistence of the best score in `localStorage`, tolerant of
 * environments where storage is unavailable or blocked.
 */

/** `localStorage` key under which the best score is stored. */
const BEST_SCORE_KEY = '2048-best-score';

/** Reads and writes the persisted best score. */
export class Storage {
	/**
	 * Loads the best score.
	 * @returns The stored score, or 0 if absent, invalid or inaccessible.
	 */
	static loadBest(): number {
		try {
			const raw = localStorage.getItem(BEST_SCORE_KEY);
			if (raw === null) {
				return 0;
			}
			const parsed = Number.parseInt(raw, 10);
			return Number.isNaN(parsed) ? 0 : parsed;
		} catch {
			return 0;
		}
	}

	/**
	 * Persists the best score, silently ignoring storage failures.
	 * @param score Score to store.
	 */
	static saveBest(score: number): void {
		try {
			localStorage.setItem(BEST_SCORE_KEY, String(score));
		} catch {
			return;
		}
	}
}
