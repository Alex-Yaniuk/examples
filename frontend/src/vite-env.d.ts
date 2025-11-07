/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STEAM_RETURN_URL?: string
  readonly VITE_STEAM_REALM?: string
  readonly VITE_STEAM_WEB_API_KEY?: string
  readonly VITE_STEAM_API_PROXY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
