import React from 'react'

const defaultTheme = {
  palette: {
    background: { default: '#fafafa' },
    primary: { main: '#1976d2', contrastText: '#ffffff' },
    text: { primary: '#1f1f1f', secondary: '#5f6368' },
    info: { main: '#0288d1', contrastText: '#ffffff' },
    divider: '#e0e0e0',
  },
  shape: { borderRadius: 12 },
  spacing(value) {
    if (typeof value === 'number') {
      return `${value * 8}px`
    }
    return value
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontSize: '2rem', fontWeight: 600 },
    body1: { fontSize: '1rem' },
    overline: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(15, 23, 42, 0.08)',
    '0px 8px 16px rgba(15, 23, 42, 0.12)',
    '0px 12px 24px rgba(15, 23, 42, 0.18)',
  ],
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') {
    return target
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (Array.isArray(sourceValue)) {
      target[key] = sourceValue.slice()
      return
    }

    if (sourceValue && typeof sourceValue === 'object') {
      target[key] = deepMerge(
        targetValue && typeof targetValue === 'object' ? { ...targetValue } : {},
        sourceValue
      )
      return
    }

    target[key] = sourceValue
  })

  return target
}

export function createTheme(options = {}) {
  return deepMerge(deepClone(defaultTheme), options)
}

const ThemeContext = React.createContext(createTheme())

export function ThemeProvider({ theme, children }) {
  const memoizedTheme = React.useMemo(() => {
    if (!theme) {
      return createTheme()
    }
    return deepMerge(createTheme(), theme)
  }, [theme])

  return React.createElement(ThemeContext.Provider, { value: memoizedTheme }, children)
}

export function useTheme() {
  return React.useContext(ThemeContext)
}

export function CssBaseline() {
  const theme = useTheme()

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    const style = document.createElement('style')
    style.setAttribute('data-mui', 'baseline')
    style.textContent = `:root { color-scheme: light; }
      *, *::before, *::after { box-sizing: border-box; }
      html, body, #root { height: 100%; }
      body { margin: 0; background-color: ${theme.palette.background.default}; color: ${theme.palette.text.primary}; font-family: ${theme.typography.fontFamily}; }`

    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [theme])

  return null
}

function resolveResponsive(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (value.xs !== undefined) {
      return value.xs
    }
    const keys = Object.keys(value)
    if (keys.length > 0) {
      return value[keys[0]]
    }
  }
  return value
}

function applySpacing(theme, key, value, style) {
  const convert = (val) => {
    if (typeof val === 'number') {
      return theme.spacing(val)
    }
    return val
  }

  const resolved = convert(resolveResponsive(value))

  switch (key) {
    case 'm':
    case 'margin':
      style.margin = resolved
      break
    case 'mt':
    case 'marginTop':
      style.marginTop = resolved
      break
    case 'mr':
    case 'marginRight':
      style.marginRight = resolved
      break
    case 'mb':
    case 'marginBottom':
      style.marginBottom = resolved
      break
    case 'ml':
    case 'marginLeft':
      style.marginLeft = resolved
      break
    case 'mx':
      style.marginLeft = resolved
      style.marginRight = resolved
      break
    case 'my':
      style.marginTop = resolved
      style.marginBottom = resolved
      break
    case 'p':
    case 'padding':
      style.padding = resolved
      break
    case 'pt':
    case 'paddingTop':
      style.paddingTop = resolved
      break
    case 'pr':
    case 'paddingRight':
      style.paddingRight = resolved
      break
    case 'pb':
    case 'paddingBottom':
      style.paddingBottom = resolved
      break
    case 'pl':
    case 'paddingLeft':
      style.paddingLeft = resolved
      break
    case 'px':
      style.paddingLeft = resolved
      style.paddingRight = resolved
      break
    case 'py':
      style.paddingTop = resolved
      style.paddingBottom = resolved
      break
    default:
      break
  }
}

function applySx(theme, sx, style = {}) {
  if (!sx) {
    return style
  }

  const entries = Array.isArray(sx) ? sx.flat() : [sx]

  entries.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return
    }

    Object.entries(item).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return
      }

      if (
        ['m', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].includes(
          key
        )
      ) {
        applySpacing(theme, key, value, style)
        return
      }

      const resolved = resolveResponsive(value)

      if (key === 'borderRadius' && typeof resolved === 'number') {
        style.borderRadius = `${resolved}px`
        return
      }

      style[key] = resolved
    })
  })

  return style
}

function combineStyles(theme, sx, style) {
  const computed = applySx(theme, sx, {})
  return { ...computed, ...style }
}

export const Box = React.forwardRef((props, ref) => {
  const { component: Component = 'div', sx, style, ...rest } = props
  const theme = useTheme()
  const mergedStyle = combineStyles(theme, sx, style)

  return React.createElement(Component, { ...rest, style: mergedStyle, ref })
})

const containerWidths = {
  xs: 444,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

export const Container = React.forwardRef((props, ref) => {
  const { maxWidth = 'lg', sx, style, ...rest } = props
  const theme = useTheme()
  const mergedStyle = {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    maxWidth: typeof maxWidth === 'number' ? maxWidth : containerWidths[maxWidth] || containerWidths.lg,
  }

  const finalStyle = combineStyles(theme, sx, { ...mergedStyle, ...style })

  return React.createElement('div', { ...rest, style: finalStyle, ref })
})

const elevations = {
  0: 'none',
  1: '0px 1px 3px rgba(15, 23, 42, 0.12)',
  2: '0px 4px 12px rgba(15, 23, 42, 0.14)',
  3: '0px 8px 24px rgba(15, 23, 42, 0.16)',
  4: '0px 12px 32px rgba(15, 23, 42, 0.18)',
  6: '0px 18px 40px rgba(15, 23, 42, 0.2)',
  8: '0px 24px 48px rgba(15, 23, 42, 0.22)',
}

export const Paper = React.forwardRef((props, ref) => {
  const { elevation = 1, square = false, sx, style, ...rest } = props
  const theme = useTheme()
  const mergedStyle = {
    backgroundColor: '#ffffff',
    borderRadius: square ? 0 : theme.shape.borderRadius,
    boxShadow: elevations[elevation] || elevations[1],
  }

  const finalStyle = combineStyles(theme, sx, { ...mergedStyle, ...style })

  return React.createElement('div', { ...rest, style: finalStyle, ref })
})

export const Stack = React.forwardRef((props, ref) => {
  const { spacing = 0, direction = 'column', divider, sx, style, alignItems, justifyContent, textAlign, ...rest } = props
  const theme = useTheme()
  const gap = typeof spacing === 'number' ? theme.spacing(spacing) : spacing
  const mergedStyle = {
    display: 'flex',
    flexDirection: direction,
    gap,
    alignItems,
    justifyContent,
    textAlign,
  }

  const finalStyle = combineStyles(theme, sx, { ...mergedStyle, ...style })

  if (!divider) {
    return React.createElement('div', { ...rest, style: finalStyle, ref })
  }

  const children = React.Children.toArray(rest.children)
  const spacedChildren = []

  children.forEach((child, index) => {
    spacedChildren.push(child)
    if (index < children.length - 1) {
      spacedChildren.push(React.cloneElement(divider, { key: `divider-${index}` }))
    }
  })

  return React.createElement('div', { ...rest, style: finalStyle, ref }, spacedChildren)
})

const typographyVariants = {
  h4: { component: 'h4', style: { fontSize: '2rem', fontWeight: 600, margin: 0 } },
  body1: { component: 'p', style: { fontSize: '1rem', margin: 0 } },
  overline: {
    component: 'span',
    style: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 },
  },
}

export const Typography = React.forwardRef((props, ref) => {
  const { component, variant = 'body1', sx, style, color, textAlign, fontWeight, letterSpacing, ...rest } = props
  const theme = useTheme()
  const variantConfig = typographyVariants[variant] || typographyVariants.body1
  const Component = component || variantConfig.component
  const mergedStyle = {
    color: color === 'text.secondary' ? theme.palette.text.secondary : undefined,
    textAlign,
    fontWeight,
    letterSpacing,
    ...variantConfig.style,
  }

  const finalStyle = combineStyles(theme, sx, { ...mergedStyle, ...style })

  return React.createElement(Component, { ...rest, style: finalStyle, ref })
})

export const Alert = React.forwardRef((props, ref) => {
  const { severity = 'info', variant = 'standard', sx, style, ...rest } = props
  const theme = useTheme()
  const palette = theme.palette[severity] || theme.palette.info
  const isOutlined = variant === 'outlined'
  const mergedStyle = {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    border: isOutlined ? `1px solid ${palette.main}` : 'none',
    backgroundColor: isOutlined ? `${palette.main}15` : palette.main,
    color: isOutlined ? palette.main : palette.contrastText,
  }

  const finalStyle = combineStyles(theme, sx, { ...mergedStyle, ...style })

  return React.createElement('div', { role: 'alert', ...rest, style: finalStyle, ref })
})

export const Button = React.forwardRef((props, ref) => {
  const { variant = 'text', color = 'primary', size = 'medium', sx, style, ...rest } = props
  const theme = useTheme()
  const palette = theme.palette[color] || theme.palette.primary

  const height = size === 'large' ? 48 : size === 'small' ? 32 : 40
  const fontSize = size === 'large' ? '1rem' : size === 'small' ? '0.8125rem' : '0.9375rem'

  let backgroundColor = 'transparent'
  let border = 'none'
  let textColor = palette.main

  if (variant === 'contained') {
    backgroundColor = palette.main
    textColor = palette.contrastText
    border = 'none'
  } else if (variant === 'outlined') {
    backgroundColor = 'transparent'
    border = `1px solid ${palette.main}`
  }

  const mergedStyle = {
    backgroundColor,
    border,
    borderRadius: theme.shape.borderRadius,
    color: textColor,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    fontSize,
    fontWeight: 600,
    minHeight: `${height}px`,
    padding: `0 ${theme.spacing(2)}`,
    textTransform: 'none',
    transition: 'background-color 150ms ease, box-shadow 150ms ease',
  }

  const finalStyle = combineStyles(theme, sx, { ...mergedStyle, ...style })

  return React.createElement('button', { type: 'button', ...rest, style: finalStyle, ref })
})

export const Link = React.forwardRef((props, ref) => {
  const { underline = 'hover', color = 'primary', sx, style, onMouseEnter, onMouseLeave, ...rest } = props
  const theme = useTheme()
  const palette = theme.palette[color] || theme.palette.primary

  const mergedStyle = {
    color: palette.main,
    textDecoration: underline === 'always' ? 'underline' : 'none',
    cursor: 'pointer',
  }

  const finalStyle = combineStyles(theme, sx, { ...mergedStyle, ...style })

  const handleMouseEnter = (event) => {
    if (underline === 'hover') {
      event.currentTarget.style.textDecoration = 'underline'
    }
    if (typeof onMouseEnter === 'function') {
      onMouseEnter(event)
    }
  }

  const handleMouseLeave = (event) => {
    if (underline === 'hover') {
      event.currentTarget.style.textDecoration = 'none'
    }
    if (typeof onMouseLeave === 'function') {
      onMouseLeave(event)
    }
  }

  return React.createElement('a', {
    ...rest,
    ref,
    style: finalStyle,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  })
})

const defaultExport = {
  Alert,
  Box,
  Button,
  Container,
  CssBaseline,
  Link,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
  useTheme,
}

export default defaultExport
