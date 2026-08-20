# CherrySoft Accounts — GitHub/Vite build

This is the GitHub-ready Vite/React wrapper around the existing CherrySoft Accounts `App.tsx` application.

## Local test

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

Push this project to a GitHub repository on the `main` branch. The included GitHub Actions workflow builds the app and deploys `dist` to GitHub Pages.

In the repository settings, ensure **Pages → Source** is set to **GitHub Actions**.

The accounting application logic in `src/App.tsx` has been retained; the previous direct-browser Babel/TSX loading approach was replaced with a standard Vite React entry point.

## Google Drive

The application currently has Google Drive persistence enabled in its existing code. Google OAuth must allow the final GitHub Pages origin in the Google Cloud OAuth configuration.
