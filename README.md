# ⌨ TypeLite

A minimalist, fast typing speed test built with Angular.

**Live demo:** [typelite.netlify.app](https://typelite.netlify.app)

---

## Features

- **WPM tracking** — real-time words-per-minute measurement
- **Accuracy & keystrokes** — correct / incorrect keystroke breakdown
- **Multiple time limits** — 1s, 30s, 60s, 120s (persisted in localStorage)
- **WPM chart** — per-second WPM, error and modification graph
- **Dark / light theme** — toggle with one click, persisted
- **Caps Lock warning**
- **Ctrl+Backspace** — clears the current word instantly
- **Top 200 / Top 1000 word modes**

---

## Getting started

```bash
npm install
npm start        # dev server at http://localhost:4200
npm run build    # production build → dist/
```

---

## Tech stack

- [Angular 19](https://angular.dev) (standalone components, signals)
- [Chart.js](https://www.chartjs.org) for the WPM graph
- Google Fonts — Open Sans

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
