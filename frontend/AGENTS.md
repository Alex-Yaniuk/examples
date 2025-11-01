# Repository Guidelines

This repository is a Vite + React + TypeScript frontend using MUI. Follow these guidelines to keep changes consistent, maintainable, and easy to review.

## Project Structure & Module Organization
- `src/` – application code (`src/App.tsx`, `src/main.tsx`). Prefer feature folders: `src/features/auth`, `src/components`, `src/lib`.
- `tests/` – reserved for unit/integration tests (currently empty).
- `index.html` – Vite entry; static assets via `public/` (if added) or imported modules.
- `dist/` – build output (do not commit).
- Config: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`.

## Build, Test, and Development Commands
- `npm run dev` – start Vite dev server (default `http://localhost:5173`).
- `npm run build` – type-check and production build (`tsc -b && vite build`) to `dist/`.
- `npm run preview` – serve the production build locally for sanity checks.
- `npm run lint` – run ESLint against the project.

## Coding Style & Naming Conventions
- TypeScript strict; adhere to ESLint rules (typescript-eslint, react-hooks, react-refresh). Fix issues before committing.
- Indentation: 2 spaces; quotes: single; match current code style (no semicolons).
- Components: PascalCase (`LoginButton.tsx`); hooks: `useX` camelCase; variables/functions: camelCase; constants: UPPER_SNAKE_CASE.
- File types: `.tsx` for React components; `.ts` for utilities; use `index.ts` only for re-exports.

## Testing Guidelines
- Tests not configured yet. Prefer Vitest + React Testing Library when adding tests.
- Place tests in `tests/` mirroring `src/` paths; name as `*.test.ts`/`*.test.tsx`.
- Cover critical flows (auth, env handling, rendering states). Keep tests fast and deterministic.

## Commit & Pull Request Guidelines
- Commits: short, imperative subject ("Add Google sign-in"); focused scope; reference issues (`#123`).
- PRs: include purpose, concise summary of changes, screenshots/GIFs for UI updates, local verification steps (`npm run dev`/`npm run preview`), and ensure `npm run lint`/`npm run build` pass.

## Security & Configuration Tips
- Do not commit secrets. Use `.env`; only expose client-side vars with the `VITE_` prefix (e.g., `VITE_GOOGLE_CLIENT_ID`).
- `vite.config.ts` sets `base: '/examples/'`; verify asset paths when deploying to subpaths.

