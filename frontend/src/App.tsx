import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState<string | null>(null)
  const buttonContainerRef = useRef<HTMLDivElement | null>(null)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) {
      console.warn('Missing VITE_GOOGLE_CLIENT_ID environment variable for Google OAuth')
      return
    }

    const initializeGoogle = () => {
      if (!window.google || !buttonContainerRef.current) {
        return
      }

      buttonContainerRef.current.innerHTML = ''

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (credentialResponse: CredentialResponse) => {
          if (!credentialResponse.credential) {
            return
          }

          const payload = parseJwt(credentialResponse.credential)
          if (payload?.email) {
            setEmail(payload.email)
          }
        },
      })

      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
      })
    }

    if (window.google) {
      initializeGoogle()
      return () => {
        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = ''
        }
      }
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        script.dataset.loaded = 'true'
        initializeGoogle()
      }
      document.head.appendChild(script)

      return () => {
        script.onload = null
        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = ''
        }
      }
    }

    if (existingScript.dataset.loaded === 'true') {
      existingScript.dataset.loaded = 'true'
      initializeGoogle()
    } else {
      const handleLoad = () => {
        existingScript.dataset.loaded = 'true'
        initializeGoogle()
      }

      existingScript.addEventListener('load', handleLoad, { once: true })

      return () => {
        existingScript.removeEventListener('load', handleLoad)
        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = ''
        }
      }
    }

    return () => {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = ''
      }
    }
  }, [clientId])

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
          <div className="details">
            <span className="label">Signed in as</span>
            <span className="email">{email}</span>
          </div>
        ) : (
          <div className="button-container" ref={buttonContainerRef} />
        )}
      </main>
    </div>
  )
}

export default App

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

type CredentialResponse = {
  credential: string
  select_by?: string
}

type GoogleId = {
  initialize(options: { client_id: string; callback: (response: CredentialResponse) => void }): void
  renderButton(parent: HTMLElement, options: { theme?: string; size?: string; type?: string }): void
}

type GoogleAccounts = {
  id: GoogleId
}

type GoogleNamespace = {
  accounts: GoogleAccounts
}

declare global {
  interface Window {
    google?: GoogleNamespace
  }
}
