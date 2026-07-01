/**
 * @file Input handling: translates arrow keys, touch swipes and on-screen
 * direction buttons into move directions.
 */

import type { Direction } from './game.js';

/** Minimum touch travel in pixels before a gesture counts as a swipe. */
const SWIPE_THRESHOLD = 24;

/** Binds all supported input sources to a single move callback. */
export class Input {
	/**
	 * Wires keyboard, swipe and button input to the given handler.
	 * @param onMove Called with the resolved direction for each input.
	 */
	static bind(onMove: (direction: Direction) => void): void {
		Input.bindKeyboard(onMove);
		Input.bindSwipe(onMove);
		Input.bindButtons(onMove);
	}

	/** Binds arrow-key presses, preventing their default scroll behavior. */
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

	/** Maps a `KeyboardEvent.key` to a direction, or undefined if unrelated. */
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

	/**
	 * Binds single-finger swipe gestures on the whole page. A swipe past
	 * {@link SWIPE_THRESHOLD} resolves to the dominant axis's direction.
	 */
	private static bindSwipe(onMove: (direction: Direction) => void): void {
		let startX = 0;
		let startY = 0;
		let tracking = false;

		document.body.addEventListener(
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

		document.body.addEventListener(
			'touchmove',
			(event) => {
				if (tracking === true) {
					event.preventDefault();
				}
			},
			{ passive: false },
		);

		document.body.addEventListener('touchend', (event) => {
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

	/** Binds the on-screen direction buttons via their `data-dir` attribute. */
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
