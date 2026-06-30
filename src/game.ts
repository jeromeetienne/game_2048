export type Direction = 'up' | 'down' | 'left' | 'right';

export type Tile = {
	id: number;
	value: number;
	row: number;
	col: number;
	mergedFrom: boolean;
	isNew: boolean;
};

export type MoveResult = {
	moved: boolean;
	scoreGained: number;
};

const GRID_SIZE = 4;

export class Game {
	private gridSize: number;
	private tiles: Map<number, Tile>;
	private nextId: number;
	private scoreValue: number;
	private wonValue: boolean;

	constructor(gridSize: number = GRID_SIZE) {
		this.gridSize = gridSize;
		this.tiles = new Map();
		this.nextId = 1;
		this.scoreValue = 0;
		this.wonValue = false;
		this.spawnTile();
		this.spawnTile();
	}

	get size(): number {
		return this.gridSize;
	}

	get score(): number {
		return this.scoreValue;
	}

	get won(): boolean {
		return this.wonValue;
	}

	getTiles(): Tile[] {
		return Array.from(this.tiles.values());
	}

	private cellOccupied(row: number, col: number): boolean {
		for (const tile of this.tiles.values()) {
			if (tile.row === row && tile.col === col) {
				return true;
			}
		}
		return false;
	}

	private tileAt(row: number, col: number): Tile | undefined {
		for (const tile of this.tiles.values()) {
			if (tile.row === row && tile.col === col) {
				return tile;
			}
		}
		return undefined;
	}

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

	private clearTransientFlags(): void {
		for (const tile of this.tiles.values()) {
			tile.mergedFrom = false;
			tile.isNew = false;
		}
	}

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

	isGameOver(): boolean {
		return this.canMove() === false;
	}
}
