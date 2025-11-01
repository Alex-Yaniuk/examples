import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SCRIPT_ID = 'google-oauth'
const PROFILE_STORAGE_KEY = 'google-profile'

type CredentialResponse = {
  credential?: string
}

type UseGoogleSignInConfig = {
  clientId?: string
  buttonContainer: RefObject<HTMLDivElement | null>
}

type GoogleSignInResult = {
  email: string | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  signOut: () => void
  retry: () => void
}

export function useGoogleSignIn({
  clientId,
  buttonContainer,
}: UseGoogleSignInConfig): GoogleSignInResult {
  const storedEmail = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
      if (!raw) {
        return null
      }
      const profile = JSON.parse(raw) as StoredProfile
      return profile.email ?? null
    } catch {
      try {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY)
      } catch {
        // best-effort cleanup
      }
      return null
    }
  }, [])

  const [email, setEmail] = useState<string | null>(storedEmail)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(() =>
    clientId ? 'loading' : 'idle',
  )
  const [error, setError] = useState<string | null>(null)
  const initializedRef = useRef(false)
  const [reloadToken, setReloadToken] = useState(0)

  const handleCredentialResponse = useCallback((response: CredentialResponse) => {
    if (!response?.credential) {
      return
    }

    const payload = parseJwt(response.credential)
    if (!payload?.email) {
      return
    }

    setEmail(payload.email)

    try {
      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ email: payload.email } satisfies StoredProfile),
      )
    } catch {
      // best-effort persistence
    }
  }, [])

  useEffect(() => {
    if (!clientId) {
      return
    }

    const initializeGoogle = () => {
      if (initializedRef.current || !window.google?.accounts?.id) {
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      })

      initializedRef.current = true
      setStatus('ready')
    }

    if (window.google?.accounts?.id) {
      initializeGoogle()
      return
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const handleLoad = () => initializeGoogle()
    const handleError = () => {
      setStatus('error')
      setError('Unable to reach Google sign-in services right now.')
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    return () => {
      script?.removeEventListener('load', handleLoad)
      script?.removeEventListener('error', handleError)
    }
  }, [clientId, handleCredentialResponse, reloadToken])

  useEffect(() => {
    if (status !== 'ready' || email || !buttonContainer.current) {
      return
    }

    const container = buttonContainer.current
    container.replaceChildren()

    window.google?.accounts?.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
    })

    window.google?.accounts?.id.prompt()
  }, [buttonContainer, email, status])

  const signOut = useCallback(() => {
    setEmail(null)

    try {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY)
    } catch {
      // ignore storage issues
    }

    window.google?.accounts?.id.disableAutoSelect?.()
    window.google?.accounts?.id.cancel?.()
  }, [])

  const retry = useCallback(() => {
    setError(null)
    setStatus(clientId ? 'loading' : 'idle')
    initializedRef.current = false

    const script = document.getElementById(SCRIPT_ID)
    script?.parentElement?.removeChild(script)

    setReloadToken((token) => token + 1)
  }, [clientId])

  const resolvedStatus = clientId ? status : 'idle'
  const resolvedError = clientId ? error : null

  return {
    email,
    status: resolvedStatus,
    error: resolvedError,
    signOut,
    retry,
  }
}

type StoredProfile = {
  email: string
}

type JwtPayload = {
  email?: string
}

function parseJwt(token: string): JwtPayload | null {
  const base64Url = token.split('.')[1]
  if (!base64Url) {
    return null
  }

  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )

    return JSON.parse(jsonPayload) as JwtPayload
  } catch {
    return null
  }
}

type GoogleId = {
  initialize(options: { client_id: string; callback: (response: CredentialResponse) => void }): void
  renderButton(parent: HTMLElement, options?: Record<string, unknown>): void
  prompt(momentListener?: () => void): void
  disableAutoSelect?: () => void
  cancel?: () => void
}

type GoogleNamespace = {
  accounts: {
    id: GoogleId
  }
}

declare global {
  interface Window {
    google?: GoogleNamespace
  }
}
