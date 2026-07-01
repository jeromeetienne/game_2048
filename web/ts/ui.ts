/**
 * @file DOM rendering layer for the 2048 board: builds the grid, syncs tile
 * elements to the {@link Game} model, updates scores and toggles overlays.
 */

import type { Game, Tile } from './game.js';

/**
 * Renders the game to the DOM. Caches one element per tile id so moves and
 * merges animate via CSS instead of rebuilding the board each frame.
 */
export class Ui {
	private gridBackground: HTMLElement;
	private tileLayer: HTMLElement;
	private scoreEl: HTMLElement;
	private bestEl: HTMLElement;
	private overlay: HTMLElement;
	private overlayMessage: HTMLElement;
	private overlayKeep: HTMLButtonElement;
	private overlayRetry: HTMLButtonElement;
	private tileElements: Map<number, HTMLElement>;

	/** Resolves and caches the DOM elements the UI drives. */
	constructor() {
		this.gridBackground = Ui.require('grid-background');
		this.tileLayer = Ui.require('tile-layer');
		this.scoreEl = Ui.require('score');
		this.bestEl = Ui.require('best');
		this.overlay = Ui.require('overlay');
		this.overlayMessage = Ui.require('overlay-message');
		this.overlayKeep = Ui.require('overlay-keep') as HTMLButtonElement;
		this.overlayRetry = Ui.require('overlay-retry') as HTMLButtonElement;
		this.tileElements = new Map();
	}

	/**
	 * Looks up an element by id.
	 * @throws If no element with that id exists.
	 */
	private static require(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (el === null) {
			throw new Error(`Missing element #${id}`);
		}
		return el;
	}

	/**
	 * Builds the static background grid cells for a board of the given size.
	 * @param size Board side length.
	 */
	buildGrid(size: number): void {
		this.gridBackground.style.setProperty('--grid-size', String(size));
		this.gridBackground.innerHTML = '';
		for (let i = 0; i < size * size; i++) {
			const cell = document.createElement('div');
			cell.className = 'grid-cell';
			this.gridBackground.appendChild(cell);
		}
		this.tileLayer.style.setProperty('--grid-size', String(size));
	}

	/**
	 * Syncs the DOM to the game's current tiles: creates elements for new
	 * tiles, updates existing ones and removes those no longer present.
	 */
	render(game: Game): void {
		const tiles = game.getTiles();
		const seen = new Set<number>();

		for (const tile of tiles) {
			seen.add(tile.id);
			let el = this.tileElements.get(tile.id);
			if (el === undefined) {
				el = this.createTileElement(tile);
				this.tileLayer.appendChild(el);
				this.tileElements.set(tile.id, el);
			}
			this.updateTileElement(el, tile);
		}

		for (const [id, el] of this.tileElements) {
			if (seen.has(id) === false) {
				el.remove();
				this.tileElements.delete(id);
			}
		}
	}

	/** Creates the DOM element for a newly seen tile, positioned at its cell. */
	private createTileElement(tile: Tile): HTMLElement {
		const el = document.createElement('div');
		el.className = 'tile';
		el.style.setProperty('--row', String(tile.row));
		el.style.setProperty('--col', String(tile.col));
		const inner = document.createElement('div');
		inner.className = 'tile-inner';
		el.appendChild(inner);
		return el;
	}

	/** Updates an existing tile element's position, value and animation classes. */
	private updateTileElement(el: HTMLElement, tile: Tile): void {
		el.style.setProperty('--row', String(tile.row));
		el.style.setProperty('--col', String(tile.col));
		const cap = Math.min(tile.value, 2048);
		el.className = `tile tile-${cap}${tile.value > 2048 ? ' tile-super' : ''}`;
		const inner = el.firstElementChild as HTMLElement;
		inner.textContent = String(tile.value);
		if (tile.isNew === true) {
			el.classList.add('tile-new');
		}
		if (tile.mergedFrom === true) {
			el.classList.add('tile-merged');
		}
	}

	/** Writes the current and best scores into their score boxes. */
	updateScores(score: number, best: number): void {
		this.scoreEl.textContent = String(score);
		this.bestEl.textContent = String(best);
	}

	/** Shows the win overlay with the "Keep playing" action. */
	showWin(): void {
		this.overlay.classList.remove('hidden');
		this.overlay.classList.add('overlay-win');
		this.overlay.classList.remove('overlay-lose');
		this.overlayMessage.textContent = 'You win!';
		this.overlayKeep.classList.remove('hidden');
	}

	/** Shows the game-over overlay. */
	showGameOver(): void {
		this.overlay.classList.remove('hidden');
		this.overlay.classList.add('overlay-lose');
		this.overlay.classList.remove('overlay-win');
		this.overlayMessage.textContent = 'Game over!';
		this.overlayKeep.classList.add('hidden');
	}

	/** Hides any active overlay. */
	hideOverlay(): void {
		this.overlay.classList.add('hidden');
		this.overlay.classList.remove('overlay-win', 'overlay-lose');
	}

	/** Registers a handler for the win overlay's "Keep playing" button. */
	onKeepPlaying(handler: () => void): void {
		this.overlayKeep.addEventListener('click', handler);
	}

	/** Registers a handler for the overlay's "Try again" button. */
	onRetry(handler: () => void): void {
		this.overlayRetry.addEventListener('click', handler);
	}
}
