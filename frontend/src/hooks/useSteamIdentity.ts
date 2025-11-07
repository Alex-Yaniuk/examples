import { useCallback, useMemo, useState } from 'react'

const STORAGE_KEY = 'steamIdentity'
const CALLBACK_PATH = '/auth/steam/callback'

type SteamIdentity = {
  steamId: string
  claimedId: string
}

const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

const readStoredIdentity = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SteamIdentity
  } catch {
    return null
  }
}

const parseSteamId = (claimedId: string | null) => {
  if (!claimedId) return null
  try {
    const url = new URL(claimedId)
    const segments = url.pathname.split('/').filter(Boolean)
    const candidate = segments[segments.length - 1]
    return candidate && /^\d+$/.test(candidate) ? candidate : null
  } catch {
    const segments = claimedId.split('/').filter(Boolean)
    const candidate = segments[segments.length - 1]
    return candidate && /^\d+$/.test(candidate) ? candidate : null
  }
}

const buildIdentityFromParams = (params: URLSearchParams): SteamIdentity | null => {
  const claimedId = params.get('openid.claimed_id')
  const steamId = parseSteamId(claimedId)
  if (!claimedId || !steamId) return null
  return { steamId, claimedId }
}

const getInitialIdentity = () => {
  if (typeof window === 'undefined') return null
  if (window.location.pathname.endsWith(CALLBACK_PATH)) {
    const params = new URLSearchParams(window.location.search)
    const nextIdentity = buildIdentityFromParams(params)
    if (nextIdentity) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIdentity))
      } catch {
        // ignore persistence issues during initialization
      }
      const basePath = getBasePath()
      window.history.replaceState(null, '', basePath)
      return nextIdentity
    }
  }
  return readStoredIdentity()
}

export const useSteamIdentity = () => {
  const [identity, setIdentity] = useState<SteamIdentity | null>(() => getInitialIdentity())

  const persistIdentity = useCallback((value: SteamIdentity | null) => {
    if (typeof window === 'undefined') return
    try {
      if (!value) {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // ignore persistence errors (e.g., storage disabled)
    }
  }, [])

  const signOut = useCallback(() => {
    setIdentity(null)
    persistIdentity(null)
  }, [persistIdentity])

  return useMemo(
    () => ({
      identity,
      isAuthenticated: Boolean(identity),
      steamId: identity?.steamId ?? null,
      signOut,
    }),
    [identity, signOut]
  )
}

export type { SteamIdentity }
