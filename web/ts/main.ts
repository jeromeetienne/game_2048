/**
 * @file Application entry point. Registers the service worker and wires the
 * {@link Game} model to the {@link Ui}, {@link Input} and {@link Storage} layers.
 */

import '../css/style.css';
import { registerSW } from 'virtual:pwa-register';
import { Game } from './game.js';
import type { Direction } from './game.js';
import { Ui } from './ui.js';
import { Input } from './input.js';
import { Storage } from './storage.js';

console.log(`[2048] service worker version: ${__SW_VERSION__}`);

registerSW({
	immediate: true,
	onRegisteredSW(swUrl, registration) {
		const state = registration?.active?.state ?? 'installing';
		console.log(`[2048] service worker ${state} (${__SW_VERSION__}) at ${swUrl}`);
	},
});

/**
 * Top-level controller: owns the game and UI, handles moves, restarts and
 * win/lose transitions, and persists the best score.
 */
class App {
	private game: Game;
	private ui: Ui;
	private best: number;
	private keepPlaying: boolean;
	private over: boolean;

	/** Boots the game, builds the UI and binds all input and button handlers. */
	constructor() {
		this.ui = new Ui();
		this.best = Storage.loadBest();
		this.keepPlaying = false;
		this.over = false;
		this.game = new Game();
		this.ui.buildGrid(this.game.size);

		const board = document.getElementById('board');
		if (board !== null) {
			Input.bind(board, (dir) => this.handleMove(dir));
		}

		const newGameButton = document.getElementById('new-game');
		if (newGameButton !== null) {
			newGameButton.addEventListener('click', () => this.restart());
		}

		this.ui.onRetry(() => this.restart());
		this.ui.onKeepPlaying(() => {
			this.keepPlaying = true;
			this.ui.hideOverlay();
		});

		this.refresh();
	}

	/**
	 * Applies a move, updates the best score, refreshes the UI and shows the
	 * win or game-over overlay when appropriate.
	 */
	private handleMove(direction: Direction): void {
		if (this.over === true) {
			return;
		}

		const result = this.game.move(direction);
		if (result.moved === false) {
			return;
		}

		if (this.game.score > this.best) {
			this.best = this.game.score;
			Storage.saveBest(this.best);
		}

		this.refresh();

		if (this.game.won === true && this.keepPlaying === false) {
			this.ui.showWin();
			return;
		}

		if (this.game.isGameOver() === true) {
			this.over = true;
			this.ui.showGameOver();
		}
	}

	/** Starts a fresh game and resets overlay and transient state. */
	private restart(): void {
		this.game = new Game();
		this.keepPlaying = false;
		this.over = false;
		this.ui.hideOverlay();
		this.ui.buildGrid(this.game.size);
		this.refresh();
	}

	/** Re-renders tiles and scores from the current game state. */
	private refresh(): void {
		this.ui.render(this.game);
		this.ui.updateScores(this.game.score, this.best);
	}
}

new App();
