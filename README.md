# 2048

Classic [2048](https://en.wikipedia.org/wiki/2048_(video_game)) game running entirely in the browser. Built with TypeScript and Vite, fully static — no backend.

## Play

🎮 **[Play it live](https://jeromeetienne.github.io/game_2048/)**

Use the arrow keys, swipe, or the on-screen buttons to slide the tiles. Join matching numbers to reach **2048**.

It's also an installable **PWA** — add it to your home screen and it works offline.

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
  images/icons/ static assets copied as-is (PWA icons, favicon)
  css/          styles
    style.css
  ts/           TypeScript source
    main.ts       app bootstrap
    game.ts       game logic (board, moves, scoring)
    ui.ts         rendering and animations
    input.ts      keyboard / swipe / button handling
    storage.ts    best-score persistence (localStorage)
    vite-env.d.ts ambient types for Vite and the PWA plugin
dist/           production build output (generated)
```

## Tech stack

- **TypeScript** (ES2020, strict)
- **Vite** — dev server and bundler
- **vite-plugin-pwa** — service worker, offline precache, and web app manifest
- **gh-pages** — deployment to GitHub Pages

## License

[MIT](LICENSE) © Jerome Etienne
