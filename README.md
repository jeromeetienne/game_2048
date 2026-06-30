# 2048

Classic [2048](https://en.wikipedia.org/wiki/2048_(video_game)) game running entirely in the browser. Built with TypeScript and Vite, fully static — no backend.

## Play

🎮 **[Play it live](https://jeromeetienne.github.io/game_2048/)**

Use the arrow keys, swipe, or the on-screen buttons to slide the tiles. Join matching numbers to reach **2048**.

## Development

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build to ./dist
npm run preview  # preview the production build
npm run deploy   # build and publish ./dist to the gh-pages branch
```

## Project structure

```
web/            HTML entry point (index.html)
src/            TypeScript source and styles
  main.ts       app bootstrap
  game.ts       game logic (board, moves, scoring)
  ui.ts         rendering and animations
  input.ts      keyboard / swipe / button handling
  storage.ts    best-score persistence (localStorage)
  style.css     styles
dist/           production build output (generated)
```

## Tech stack

- **TypeScript** (ES2020, strict)
- **Vite** — dev server and bundler
- **gh-pages** — deployment to GitHub Pages
