const BEST_SCORE_KEY = '2048-best-score';

export class Storage {
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

	static saveBest(score: number): void {
		try {
			localStorage.setItem(BEST_SCORE_KEY, String(score));
		} catch {
			return;
		}
	}
}
