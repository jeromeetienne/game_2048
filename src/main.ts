import './style.css';
import { registerSW } from 'virtual:pwa-register';
import { Game } from './game.js';
import type { Direction } from './game.js';
import { Ui } from './ui.js';
import { Input } from './input.js';
import { Storage } from './storage.js';

registerSW({ immediate: true });

class App {
	private game: Game;
	private ui: Ui;
	private best: number;
	private keepPlaying: boolean;
	private over: boolean;

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

	private restart(): void {
		this.game = new Game();
		this.keepPlaying = false;
		this.over = false;
		this.ui.hideOverlay();
		this.ui.buildGrid(this.game.size);
		this.refresh();
	}

	private refresh(): void {
		this.ui.render(this.game);
		this.ui.updateScores(this.game.score, this.best);
	}
}

new App();
