# Minimax Atelier

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JavaScript-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

This project is a small browser arcade built with plain HTML, CSS, and JavaScript. The interface pairs a styled 3x3 board with a status panel, move log, reset controls, and an AI mode selector so each match feels a little different without adding any build tooling or backend complexity.

The app is intentionally lightweight. Open the page, make a move, and the AI responds immediately using one of four personalities: perfect, tactical, mirror, or random.

## Features

- Perfect minimax AI with alpha-beta pruning for unbeatable play.
- Tactical, mirror, and random opponent modes for different difficulty styles.
- Live status panel with winner, turn, and last-move indicators.
- Move log and reset flow to keep rounds easy to follow.
- Static, browser-only implementation with no external dependencies.

## Tech Stack

- HTML for structure
- CSS for the responsive editorial-style interface
- JavaScript for game state, AI selection, and board rendering

## Local Preview

You can open the app directly by loading `index.html` in a browser, or serve the folder with any static server.

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deployment

This project is GitHub Pages friendly. Publish the folder that contains `index.html`, `app.js`, `game.js`, and `styles.css`, or copy those files into the folder your Pages configuration serves.

## Project Structure

```text
minimax_web/
├── app.js
├── game.js
├── index.html
├── styles.css
├── README.md
└── LICENSE
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for the full text.
