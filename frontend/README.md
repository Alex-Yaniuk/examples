# Frontend

## Steam SSO configuration

The Steam sign-in button builds an OpenID request using two optional environment variables:

- `VITE_STEAM_RETURN_URL` – absolute URL Steam redirects to after the player approves the login (defaults to `https://<host>/auth/steam/callback` at runtime).
- `VITE_STEAM_REALM` – the relying-party realm (defaults to the origin of `VITE_STEAM_RETURN_URL`).
- `VITE_STEAM_WEB_API_KEY` – Steam Web API key used to call `GetPlayerSummaries`. This is required to show real persona data client-side.
- `VITE_STEAM_API_PROXY` – optional CORS proxy for Steam Web API calls. Defaults to `https://cors.isomorphic-git.org/`. Set to an empty string to call the API directly or provide your own proxy (e.g., `https://corsproxy.io/?url={url}`).

Create a `.env.local` file alongside `package.json` to override the defaults while developing:

```
VITE_STEAM_RETURN_URL=http://localhost:4173/examples/auth/steam/callback
VITE_STEAM_REALM=http://localhost:4173
VITE_STEAM_WEB_API_KEY=<your-key>
VITE_STEAM_API_PROXY=https://cors.isomorphic-git.org/
```

Restart `npm run dev` after changing these values so Vite can pick them up.

> **Security note:** Storing `VITE_STEAM_WEB_API_KEY` in client-side code is only suitable for demos. Real deployments should proxy Steam API calls through a backend so the key remains secret.

If your chosen proxy requires URL encoding, include `{url}` (or `%URL%`) in `VITE_STEAM_API_PROXY` and it will be replaced with the encoded Steam endpoint automatically.

### Client-only callback handling

This project does **not** include a backend to validate Steam OpenID responses. Instead, the callback at `/auth/steam/callback` is handled in the browser:

- When Steam redirects back, the query params are parsed, the `steamId` is pulled from `openid.claimed_id`, and the lightweight session is saved in `localStorage`.
- The landing page switches to a signed-in state, surfaces a profile card, and offers a “Sign out” button that clears the stored identity.
- When `VITE_STEAM_WEB_API_KEY` is set, the profile card fetches `GetPlayerSummaries` (optionally via the configured proxy) to display the user’s persona name, avatar, and profile URL. Without the key, the UI falls back to deterministic placeholders.

Because there is no server-side verification, the signed-in state is for demos only and must not be used for real authentication flows.
