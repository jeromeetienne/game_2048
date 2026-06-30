import type { Direction } from './game.js';

const SWIPE_THRESHOLD = 24;

export class Input {
	static bind(board: HTMLElement, onMove: (direction: Direction) => void): void {
		Input.bindKeyboard(onMove);
		Input.bindSwipe(board, onMove);
		Input.bindButtons(onMove);
	}

	private static bindKeyboard(onMove: (direction: Direction) => void): void {
		window.addEventListener('keydown', (event) => {
			const dir = Input.keyToDirection(event.key);
			if (dir === undefined) {
				return;
			}
			event.preventDefault();
			onMove(dir);
		});
	}

	private static keyToDirection(key: string): Direction | undefined {
		switch (key) {
			case 'ArrowUp':
				return 'up';
			case 'ArrowDown':
				return 'down';
			case 'ArrowLeft':
				return 'left';
			case 'ArrowRight':
				return 'right';
			default:
				return undefined;
		}
	}

	private static bindSwipe(board: HTMLElement, onMove: (direction: Direction) => void): void {
		let startX = 0;
		let startY = 0;
		let tracking = false;

		board.addEventListener(
			'touchstart',
			(event) => {
				if (event.touches.length !== 1) {
					return;
				}
				tracking = true;
				startX = event.touches[0].clientX;
				startY = event.touches[0].clientY;
			},
			{ passive: true },
		);

		board.addEventListener(
			'touchmove',
			(event) => {
				if (tracking === true) {
					event.preventDefault();
				}
			},
			{ passive: false },
		);

		board.addEventListener('touchend', (event) => {
			if (tracking === false) {
				return;
			}
			tracking = false;
			const touch = event.changedTouches[0];
			const dx = touch.clientX - startX;
			const dy = touch.clientY - startY;
			const absX = Math.abs(dx);
			const absY = Math.abs(dy);

			if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
				return;
			}

			if (absX > absY) {
				onMove(dx > 0 ? 'right' : 'left');
			} else {
				onMove(dy > 0 ? 'down' : 'up');
			}
		});
	}

	private static bindButtons(onMove: (direction: Direction) => void): void {
		const buttons = document.querySelectorAll<HTMLButtonElement>('.ctrl');
		buttons.forEach((button) => {
			button.addEventListener('click', () => {
				const dir = button.dataset.dir as Direction | undefined;
				if (dir === undefined) {
					return;
				}
				onMove(dir);
			});
		});
	}
}
