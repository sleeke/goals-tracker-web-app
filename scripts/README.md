# scripts

Shell scripts used for CI and release automation.

| File / Folder | Purpose |
|---|---|
| [`test-and-publish.sh`](test-and-publish.sh) | Builds the project, starts the [Vite](https://vite.dev/) dev server in the background, waits for it to be reachable, runs the full Playwright E2E suite, and then deploys to [Firebase Hosting](https://firebase.google.com/docs/hosting) via `firebase deploy`. Cleans up the background server on exit via a `trap`. Invoked by `npm run publish`. |

## Usage

```bash
npm run publish
# or directly:
bash ./scripts/test-and-publish.sh
```

Requires `firebase-tools` to be installed and authenticated (`firebase login`).
