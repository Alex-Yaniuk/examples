import React from 'react'

export const ThemeContext = React.createContext({})

export function ThemeProvider({ theme = {}, children }) {
  return React.createElement(ThemeContext.Provider, { value: theme }, children)
}

export function CacheProvider({ children }) {
  return React.createElement(React.Fragment, null, children)
}

export function useTheme() {
  return React.useContext(ThemeContext)
}

export function jsx(type, props, key) {
  if (key !== undefined) {
    return React.createElement(type, { ...props, key })
  }
  return React.createElement(type, props)
}

export function css() {
  return {}
}

export function Global({ styles }) {
  React.useEffect(() => {
    if (!styles || typeof document === 'undefined') {
      return undefined
    }

    const styleElement = document.createElement('style')
    styleElement.setAttribute('data-emotion', 'css')

    if (typeof styles === 'string') {
      styleElement.textContent = styles
    } else if (typeof styles === 'object') {
      const entries = Object.entries(styles)
        .map(([selector, declarations]) => {
          if (typeof declarations === 'string') {
            return `${selector} { ${declarations} }`
          }

          if (!declarations || typeof declarations !== 'object') {
            return ''
          }

          const body = Object.entries(declarations)
            .map(([prop, value]) => `${prop}: ${value};`)
            .join(' ')

          return `${selector} { ${body} }`
        })
        .filter(Boolean)
        .join('\n')

      styleElement.textContent = entries
    }

    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [styles])

  return null
}

const defaultExport = {
  CacheProvider,
  Global,
  ThemeContext,
  ThemeProvider,
  jsx,
  css,
  useTheme,
}

export default defaultExport
