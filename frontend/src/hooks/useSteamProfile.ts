import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

const STEAM_SUMMARIES_ENDPOINT = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/'
const DEFAULT_PROXY = 'https://cors.isomorphic-git.org/'

type SteamProfile = {
  steamId: string
  personaName: string
  avatarUrl: string
  profileUrl: string
  realName?: string
  countryCode?: string
}

type SteamProfileStatus = 'idle' | 'requires-key' | 'loading' | 'success' | 'error'

type SteamProfileState = {
  status: SteamProfileStatus
  profile: SteamProfile | null
  error: string | null
}

type Action =
  | { type: 'reset' }
  | { type: 'requires-key' }
  | { type: 'loading' }
  | { type: 'success'; profile: SteamProfile }
  | { type: 'error'; error: string }

const applyProxy = (targetUrl: string, proxy: string | undefined) => {
  if (!proxy) return targetUrl
  const trimmed = proxy.trim()
  if (!trimmed) return targetUrl
  if (trimmed.includes('{url}')) return trimmed.replace('{url}', encodeURIComponent(targetUrl))
  if (trimmed.includes('%URL%')) return trimmed.replace('%URL%', encodeURIComponent(targetUrl))
  if (trimmed.endsWith('/') || trimmed.endsWith('?') || trimmed.endsWith('&')) {
    return `${trimmed}${targetUrl}`
  }
  return `${trimmed}/${targetUrl}`
}

const initialState: SteamProfileState = {
  status: 'idle',
  profile: null,
  error: null,
}

const reducer = (_state: SteamProfileState, action: Action): SteamProfileState => {
  switch (action.type) {
    case 'reset':
      return initialState
    case 'requires-key':
      return { status: 'requires-key', profile: null, error: 'Add VITE_STEAM_WEB_API_KEY to fetch profile data.' }
    case 'loading':
      return { status: 'loading', profile: null, error: null }
    case 'success':
      return { status: 'success', profile: action.profile, error: null }
    case 'error':
      return { status: 'error', profile: null, error: action.error }
    default:
      return initialState
  }
}

export const useSteamProfile = (steamId: string | null) => {
  const apiKey = import.meta.env.VITE_STEAM_WEB_API_KEY
  const proxyEnv = import.meta.env.VITE_STEAM_API_PROXY
  const apiProxy = proxyEnv === undefined ? DEFAULT_PROXY : proxyEnv
  const [state, dispatch] = useReducer(reducer, initialState)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!steamId) {
      dispatch({ type: 'reset' })
      return
    }
    if (!apiKey) {
      dispatch({ type: 'requires-key' })
      return
    }

    let active = true
    const controller = new AbortController()
    dispatch({ type: 'loading' })

    const fetchProfile = async () => {
      const url = new URL(STEAM_SUMMARIES_ENDPOINT)
      url.searchParams.set('key', apiKey)
      url.searchParams.set('steamids', steamId)

      const requestUrl = applyProxy(url.toString(), apiProxy)
      const response = await fetch(requestUrl, { signal: controller.signal })
      if (!response.ok) throw new Error('Unable to load Steam profile. Try again in a moment.')
      const payload = await response.json()
      const player = payload?.response?.players?.[0]
      if (!player) throw new Error('Steam profile not found for this account.')

      const profile: SteamProfile = {
        steamId: player.steamid,
        personaName: player.personaname,
        avatarUrl: player.avatarfull ?? player.avatar,
        profileUrl: player.profileurl,
        realName: player.realname,
        countryCode: player.loccountrycode,
      }
      return profile
    }

    fetchProfile()
      .then(profile => {
        if (!active) return
        dispatch({ type: 'success', profile })
      })
      .catch(error => {
        if (!active || controller.signal.aborted) return
        dispatch({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      })

    return () => {
      active = false
      controller.abort()
    }
    // refreshToken ensures manual refreshes re-run the effect
  }, [steamId, apiKey, apiProxy, refreshToken])

  const refresh = useCallback(() => {
    setRefreshToken(token => token + 1)
  }, [])

  return useMemo(
    () => ({
      ...state,
      requiresApiKey: state.status === 'requires-key',
      refresh,
    }),
    [refresh, state]
  )
}

export type { SteamProfile, SteamProfileStatus }
