/**
 * @file Core 2048 game logic: board state, tile movement, merging and scoring.
 * Pure model with no DOM dependencies — rendering lives in {@link Ui}.
 */

/** A direction the tiles can be slid. */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** A single tile on the board. */
export type Tile = {
	/** Stable identity used to track the tile across renders. */
	id: number;
	/** Numeric value shown on the tile (a power of two). */
	value: number;
	/** Zero-based row index. */
	row: number;
	/** Zero-based column index. */
	col: number;
	/** True on the frame this tile was produced by a merge. */
	mergedFrom: boolean;
	/** True on the frame this tile was spawned. */
	isNew: boolean;
};

/** Outcome of a single {@link Game.move} call. */
export type MoveResult = {
	/** Whether any tile changed position or merged. */
	moved: boolean;
	/** Points earned from merges during the move. */
	scoreGained: number;
};

/** Default board dimension (a 4×4 grid). */
const GRID_SIZE = 4;

/**
 * Stateful 2048 game engine. Holds the set of tiles and applies moves,
 * merges, scoring and win/lose detection.
 */
export class Game {
	private gridSize: number;
	private tiles: Map<number, Tile>;
	private nextId: number;
	private scoreValue: number;
	private wonValue: boolean;

	/**
	 * Creates a new game with two starting tiles already spawned.
	 * @param gridSize Board side length; defaults to {@link GRID_SIZE}.
	 */
	constructor(gridSize: number = GRID_SIZE) {
		this.gridSize = gridSize;
		this.tiles = new Map();
		this.nextId = 1;
		this.scoreValue = 0;
		this.wonValue = false;
		this.spawnTile();
		this.spawnTile();
	}

	/** Board side length. */
	get size(): number {
		return this.gridSize;
	}

	/** Current score. */
	get score(): number {
		return this.scoreValue;
	}

	/** Whether a 2048 tile has been reached. */
	get won(): boolean {
		return this.wonValue;
	}

	/** Returns a snapshot array of the current tiles. */
	getTiles(): Tile[] {
		return Array.from(this.tiles.values());
	}

	/** Returns true if a tile currently occupies the given cell. */
	private cellOccupied(row: number, col: number): boolean {
		for (const tile of this.tiles.values()) {
			if (tile.row === row && tile.col === col) {
				return true;
			}
		}
		return false;
	}

	/** Returns the tile at the given cell, or undefined if empty. */
	private tileAt(row: number, col: number): Tile | undefined {
		for (const tile of this.tiles.values()) {
			if (tile.row === row && tile.col === col) {
				return tile;
			}
		}
		return undefined;
	}

	/** Returns every unoccupied cell on the board. */
	private emptyCells(): Array<{ row: number; col: number }> {
		const cells: Array<{ row: number; col: number }> = [];
		for (let row = 0; row < this.gridSize; row++) {
			for (let col = 0; col < this.gridSize; col++) {
				if (this.cellOccupied(row, col) === false) {
					cells.push({ row, col });
				}
			}
		}
		return cells;
	}

	/**
	 * Spawns a new tile in a random empty cell (90% a 2, 10% a 4).
	 * @returns The spawned tile, or undefined if the board is full.
	 */
	private spawnTile(): Tile | undefined {
		const cells = this.emptyCells();
		if (cells.length === 0) {
			return undefined;
		}
		const cell = cells[Math.floor(Math.random() * cells.length)];
		const value = Math.random() < 0.9 ? 2 : 4;
		const tile: Tile = {
			id: this.nextId++,
			value,
			row: cell.row,
			col: cell.col,
			mergedFrom: false,
			isNew: true,
		};
		this.tiles.set(tile.id, tile);
		return tile;
	}

	/** Resets the per-move `isNew` and `mergedFrom` flags on all tiles. */
	private clearTransientFlags(): void {
		for (const tile of this.tiles.values()) {
			tile.mergedFrom = false;
			tile.isNew = false;
		}
	}

	/**
	 * Builds the row/column visit order for a move so tiles farthest in the
	 * direction of travel are processed first.
	 */
	private buildTraversal(direction: Direction): { rows: number[]; cols: number[] } {
		const rows: number[] = [];
		const cols: number[] = [];
		for (let i = 0; i < this.gridSize; i++) {
			rows.push(i);
			cols.push(i);
		}
		if (direction === 'down') {
			rows.reverse();
		}
		if (direction === 'right') {
			cols.reverse();
		}
		return { rows, cols };
	}

	/** Maps a direction to its row/column delta. */
	private vector(direction: Direction): { dr: number; dc: number } {
		switch (direction) {
			case 'up':
				return { dr: -1, dc: 0 };
			case 'down':
				return { dr: 1, dc: 0 };
			case 'left':
				return { dr: 0, dc: -1 };
			case 'right':
				return { dr: 0, dc: 1 };
		}
	}

	/**
	 * Slides all tiles in the given direction, merging equal adjacent pairs
	 * once each and spawning a new tile if anything moved.
	 * @param direction Direction to slide the tiles.
	 * @returns Whether the board changed and how many points were gained.
	 */
	move(direction: Direction): MoveResult {
		this.clearTransientFlags();

		const { dr, dc } = this.vector(direction);
		const { rows, cols } = this.buildTraversal(direction);
		let moved = false;
		let scoreGained = 0;

		for (const row of rows) {
			for (const col of cols) {
				const tile = this.tileAt(row, col);
				if (tile === undefined) {
					continue;
				}

				let nextRow = tile.row;
				let nextCol = tile.col;
				let target: Tile | undefined;

				while (true) {
					const candRow = nextRow + dr;
					const candCol = nextCol + dc;
					if (candRow < 0 || candRow >= this.gridSize || candCol < 0 || candCol >= this.gridSize) {
						break;
					}
					const occupant = this.tileAt(candRow, candCol);
					if (occupant !== undefined) {
						target = occupant;
						break;
					}
					nextRow = candRow;
					nextCol = candCol;
				}

				if (target !== undefined && target.value === tile.value && target.mergedFrom === false) {
					target.value *= 2;
					target.mergedFrom = true;
					scoreGained += target.value;
					this.tiles.delete(tile.id);
					moved = true;
					if (target.value === 2048) {
						this.wonValue = true;
					}
					continue;
				}

				if (nextRow !== tile.row || nextCol !== tile.col) {
					tile.row = nextRow;
					tile.col = nextCol;
					moved = true;
				}
			}
		}

		if (moved === true) {
			this.scoreValue += scoreGained;
			this.spawnTile();
		}

		return { moved, scoreGained };
	}

	/** Returns true if any move is still possible (empty cell or mergeable pair). */
	canMove(): boolean {
		if (this.emptyCells().length > 0) {
			return true;
		}
		for (let row = 0; row < this.gridSize; row++) {
			for (let col = 0; col < this.gridSize; col++) {
				const tile = this.tileAt(row, col);
				if (tile === undefined) {
					continue;
				}
				const right = this.tileAt(row, col + 1);
				const down = this.tileAt(row + 1, col);
				if (right !== undefined && right.value === tile.value) {
					return true;
				}
				if (down !== undefined && down.value === tile.value) {
					return true;
				}
			}
		}
		return false;
	}

	/** Returns true when no further moves are possible. */
	isGameOver(): boolean {
		return this.canMove() === false;
	}
}
