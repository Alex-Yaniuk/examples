import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState<string | null>(null)
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const buttonContainerRef = useRef<HTMLDivElement | null>(null)
  const hasRenderedButton = useRef(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const clearGoogleButton = useCallback(() => {
    const container = buttonContainerRef.current
    if (!container) {
      return
    }

    container.innerHTML = ''
    hasRenderedButton.current = false
  }, [])

  const handleCredentialResponse = useCallback(
    (credentialResponse: CredentialResponse) => {
      if (!credentialResponse.credential) {
        return
      }

      const payload = parseJwt(credentialResponse.credential)
      if (!payload?.email) {
        return
      }

      setEmail(payload.email)
      clearGoogleButton()

      try {
        window.localStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify({ email: payload.email } as StoredProfile)
        )
      } catch (error) {
        console.warn('Unable to persist Google profile', error)
      }
    },
    [clearGoogleButton]
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY)
      if (!storedProfile) {
        return
      }

      const profile: StoredProfile = JSON.parse(storedProfile)
      if (profile?.email) {
        setEmail(profile.email)
      }
    } catch (error) {
      console.warn('Unable to restore stored Google profile', error)
      try {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY)
      } catch (cleanupError) {
        console.warn('Unable to clear invalid stored Google profile', cleanupError)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY)
      if (!storedProfile) {
        return
      }

      const profile: StoredProfile = JSON.parse(storedProfile)
      if (profile?.email) {
        setEmail(profile.email)
      }
    } catch (error) {
      console.warn('Unable to restore stored Google profile', error)
      try {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY)
      } catch (cleanupError) {
        console.warn('Unable to clear invalid stored Google profile', cleanupError)
      }
    }
  }, [])

  useEffect(() => {
    if (!clientId) {
      console.warn('Missing VITE_GOOGLE_CLIENT_ID environment variable for Google OAuth')
      return
    }

    let cancelled = false

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) {
        return
      }

      clearGoogleButton()
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      })

      setIsGoogleReady(true)
    }

    const attachLoadHandler = (script: HTMLScriptElement) => {
      const onLoad = () => {
        if (cancelled) {
          return
        }

        script.dataset.loaded = 'true'
        initializeGoogle()
      }

      if (script.dataset.loaded === 'true') {
        initializeGoogle()
        return undefined
      }

      script.addEventListener('load', onLoad, { once: true })

      return () => {
        script.removeEventListener('load', onLoad)
      }
    }

    if (window.google?.accounts?.id) {
      initializeGoogle()
      return () => {
        cancelled = true
      }
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    let cleanupLoad: (() => void) | undefined

    if (existingScript) {
      cleanupLoad = attachLoadHandler(existingScript)
    } else {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      cleanupLoad = attachLoadHandler(script)
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      cleanupLoad?.()
      setIsGoogleReady(false)
      clearGoogleButton()
    }
  }, [clearGoogleButton, clientId, handleCredentialResponse])

  useEffect(() => {
    if (!isGoogleReady || !buttonContainerRef.current || !window.google?.accounts?.id) {
      return
    }

    const container = buttonContainerRef.current
    if (!container) {
      return
    }

    if (email) {
      clearGoogleButton()
      return
    }

    if (hasRenderedButton.current) {
      return
    }

    clearGoogleButton()
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
    })
    window.google.accounts.id.prompt()
    hasRenderedButton.current = true

    return () => {
      clearGoogleButton()
    }
  }, [clearGoogleButton, email, isGoogleReady])

  const handleSignOut = () => {
    try {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY)
    } catch (error) {
      console.warn('Unable to clear stored Google profile', error)
    }

    setEmail(null)
    window.google?.accounts.id.disableAutoSelect()
    window.google?.accounts.id.cancel()
  }

  return (
    <div className="app">
      <main className="panel">
        <h1 className="title">Sign in</h1>
        {!clientId && (
          <p className="hint">
            Configure <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
          </p>
        )}
        {email ? (
          <div className="signed-in">
            <div className="details">
              <span className="label">Signed in as</span>
              <span className="email">{email}</span>
            </div>
            <button type="button" className="sign-out" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="button-container" ref={buttonContainerRef} />
        )}
      </main>
    </div>
  )
}

export default App

type StoredProfile = {
  email: string
}

type JwtPayload = {
  email?: string
}

function parseJwt(token: string): JwtPayload | null {
  const base64Url = token.split('.')[1]
  if (!base64Url) return null

  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse JWT payload', error)
    return null
  }
}

const SCRIPT_ID = 'google-oauth'
const PROFILE_STORAGE_KEY = 'google-profile'

type CredentialResponse = {
  credential: string
  select_by?: string
}

type GoogleId = {
  initialize(options: { client_id: string; callback: (response: CredentialResponse) => void }): void
  renderButton(parent: HTMLElement, options: { theme?: string; size?: string; type?: string }): void
  prompt(momentListener?: (notification: PromptMomentNotification) => void): void
  disableAutoSelect(): void
  cancel(): void
}

type GoogleAccounts = {
  id: GoogleId
}

type GoogleNamespace = {
  accounts: GoogleAccounts
}

type PromptMomentNotification = {
  isDismissedMoment(): boolean
  isDisplayed(): boolean
  isNotDisplayed(): boolean
  getDismissedReason(): string
  getMomentType(): string
}

declare global {
  interface Window {
    google?: GoogleNamespace
  }
}
