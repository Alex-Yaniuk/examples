import {
  CSSProperties,
  ElementType,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
} from 'react'

type PaletteColor = {
  main: string
  contrastText?: string
}

type Palette = {
  primary: PaletteColor
  info: PaletteColor
  success: PaletteColor
  warning: PaletteColor
  error: PaletteColor
  text: {
    primary: string
    secondary: string
  }
  background: {
    default: string
  }
}

type TypographyVariant = {
  fontSize: string
  fontWeight?: number
  letterSpacing?: CSSProperties['letterSpacing']
  textTransform?: CSSProperties['textTransform']
  lineHeight?: CSSProperties['lineHeight']
}

type Typography = {
  fontFamily: string
  h4: TypographyVariant
  body1: TypographyVariant
  overline: TypographyVariant
  button: TypographyVariant
}

type Theme = {
  palette: Palette
  shape: {
    borderRadius: number
  }
  typography: Typography
  spacing: (value: number) => string
}

type ThemeOptions = {
  palette?: {
    primary?: Partial<PaletteColor>
    info?: Partial<PaletteColor>
    success?: Partial<PaletteColor>
    warning?: Partial<PaletteColor>
    error?: Partial<PaletteColor>
    text?: Partial<Palette['text']>
    background?: Partial<Palette['background']>
  }
  shape?: Partial<Theme['shape']>
  typography?: Partial<Typography>
  spacing?: Theme['spacing']
}

type SxProps =
  | CSSProperties
  | ((theme: Theme) => CSSProperties)
  | Array<SxProps | undefined>

const defaultTheme: Theme = {
  palette: {
    primary: { main: '#1976d2', contrastText: '#ffffff' },
    info: { main: '#0288d1', contrastText: '#ffffff' },
    success: { main: '#2e7d32', contrastText: '#ffffff' },
    warning: { main: '#ed6c02', contrastText: '#ffffff' },
    error: { main: '#d32f2f', contrastText: '#ffffff' },
    text: {
      primary: '#1f1f1f',
      secondary: '#5c5c5c',
    },
    background: {
      default: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h4: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    overline: {
      fontSize: '0.75rem',
      letterSpacing: '0.125em',
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.0125em',
    },
  },
  spacing: (value: number) => `${value * 8}px`,
}

const ThemeContext = createContext<Theme>(defaultTheme)

export function createTheme(options: ThemeOptions = {}): Theme {
  return {
    palette: {
      primary: { ...defaultTheme.palette.primary, ...options.palette?.primary },
      info: { ...defaultTheme.palette.info, ...options.palette?.info },
      success: { ...defaultTheme.palette.success, ...options.palette?.success },
      warning: { ...defaultTheme.palette.warning, ...options.palette?.warning },
      error: { ...defaultTheme.palette.error, ...options.palette?.error },
      text: { ...defaultTheme.palette.text, ...options.palette?.text },
      background: { ...defaultTheme.palette.background, ...options.palette?.background },
    },
    shape: { ...defaultTheme.shape, ...options.shape },
    typography: { ...defaultTheme.typography, ...options.typography },
    spacing: options.spacing ?? defaultTheme.spacing,
  }
}

export interface ThemeProviderProps {
  theme: Theme
  children: ReactNode
}

export const ThemeProvider = ({ theme, children }: ThemeProviderProps) => {
  const value = useMemo<Theme>(() => ({
    palette: {
      primary: { ...defaultTheme.palette.primary, ...theme.palette.primary },
      info: { ...defaultTheme.palette.info, ...theme.palette.info },
      success: { ...defaultTheme.palette.success, ...theme.palette.success },
      warning: { ...defaultTheme.palette.warning, ...theme.palette.warning },
      error: { ...defaultTheme.palette.error, ...theme.palette.error },
      text: { ...defaultTheme.palette.text, ...theme.palette.text },
      background: { ...defaultTheme.palette.background, ...theme.palette.background },
    },
    shape: { ...defaultTheme.shape, ...theme.shape },
    typography: { ...defaultTheme.typography, ...theme.typography },
    spacing: theme.spacing ?? defaultTheme.spacing,
  }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const useTheme = () => useContext(ThemeContext)

export const CssBaseline = () => {
  const theme = useTheme()

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const { body } = document
    const previous = {
      backgroundColor: body.style.backgroundColor,
      color: body.style.color,
      fontFamily: body.style.fontFamily,
      margin: body.style.margin,
    }

    body.style.backgroundColor = theme.palette.background.default
    body.style.color = theme.palette.text.primary
    body.style.fontFamily = theme.typography.fontFamily
    body.style.margin = '0'

    return () => {
      body.style.backgroundColor = previous.backgroundColor
      body.style.color = previous.color
      body.style.fontFamily = previous.fontFamily
      body.style.margin = previous.margin
    }
  }, [theme])

  return null
}

function resolveSx(sx: SxProps | undefined, theme: Theme): CSSProperties | undefined {
  if (!sx) {
    return undefined
  }

  if (Array.isArray(sx)) {
    return sx.reduce<CSSProperties>((acc, current) => {
      if (!current) {
        return acc
      }
      const value = resolveSx(current, theme)
      return value ? { ...acc, ...value } : acc
    }, {})
  }

  if (typeof sx === 'function') {
    return sx(theme)
  }

  return sx
}

function mergeStyles(
  theme: Theme,
  base: CSSProperties | undefined,
  sx: SxProps | undefined,
  style: CSSProperties | undefined
): CSSProperties {
  const combined = base ? (sx ? [base, sx] : base) : sx
  const resolved = resolveSx(combined as SxProps | undefined, theme)
  return {
    ...(resolved ?? (base ?? {})),
    ...(style ?? {}),
  }
}

type BoxProps = HTMLAttributes<HTMLElement> & {
  component?: ElementType
  sx?: SxProps
}

export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { component: Component = 'div', sx, style, children, ...rest },
  ref
) {
  const theme = useTheme()
  const mergedStyle = mergeStyles(theme, undefined, sx, style as CSSProperties | undefined)
  return (
    <Component ref={ref as any} style={mergedStyle} {...rest}>
      {children}
    </Component>
  )
})

interface ContainerProps extends Omit<BoxProps, 'component'> {
  maxWidth?: 'sm' | 'md' | 'lg' | false
}

const CONTAINER_MAX_WIDTH: Record<'sm' | 'md' | 'lg', string> = {
  sm: '600px',
  md: '768px',
  lg: '1200px',
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { maxWidth = 'md', sx, style, children, ...rest },
  ref
) {
  const theme = useTheme()
  const base: CSSProperties = {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  }

  if (maxWidth) {
    base.maxWidth = CONTAINER_MAX_WIDTH[maxWidth]
  }

  const mergedStyle = mergeStyles(theme, base, sx, style as CSSProperties | undefined)
  return (
    <div ref={ref} style={mergedStyle} {...rest}>
      {children}
    </div>
  )
})

interface PaperProps extends Omit<BoxProps, 'component'> {
  elevation?: number
}

const ELEVATION_SHADOWS = [
  'none',
  '0 2px 6px rgba(15, 23, 42, 0.15)',
  '0 6px 18px rgba(15, 23, 42, 0.18)',
  '0 12px 32px rgba(15, 23, 42, 0.2)',
]

function getElevationShadow(elevation: number): string {
  const index = Math.max(0, Math.min(ELEVATION_SHADOWS.length - 1, Math.round(elevation)))
  return ELEVATION_SHADOWS[index]
}

export const Paper = forwardRef<HTMLDivElement, PaperProps>(function Paper(
  { elevation = 1, sx, style, children, ...rest },
  ref
) {
  const theme = useTheme()
  const base: CSSProperties = {
    backgroundColor: '#ffffff',
    color: theme.palette.text.primary,
    borderRadius: `${theme.shape.borderRadius}px`,
    boxShadow: getElevationShadow(elevation),
  }

  const mergedStyle = mergeStyles(theme, base, sx, style as CSSProperties | undefined)
  return (
    <div ref={ref} style={mergedStyle} {...rest}>
      {children}
    </div>
  )
})

interface StackProps extends Omit<BoxProps, 'component'> {
  spacing?: number | string
  direction?: CSSProperties['flexDirection']
  alignItems?: CSSProperties['alignItems']
  justifyContent?: CSSProperties['justifyContent']
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { spacing = 0, direction = 'column', alignItems, justifyContent, sx, style, children, ...rest },
  ref
) {
  const theme = useTheme()
  const gapValue = typeof spacing === 'number' ? theme.spacing(spacing) : spacing
  const base: CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap: gapValue,
  }

  if (alignItems) {
    base.alignItems = alignItems
  }

  if (justifyContent) {
    base.justifyContent = justifyContent
  }

  const mergedStyle = mergeStyles(theme, base, sx, style as CSSProperties | undefined)
  return (
    <div ref={ref} style={mergedStyle} {...rest}>
      {children}
    </div>
  )
})

interface TypographyProps extends Omit<BoxProps, 'component'> {
  component?: ElementType
  variant?: 'h4' | 'body1' | 'overline'
  color?: 'inherit' | 'text.primary' | 'text.secondary' | string
  fontWeight?: CSSProperties['fontWeight']
  textAlign?: CSSProperties['textAlign']
  letterSpacing?: CSSProperties['letterSpacing']
}

const TYPOGRAPHY_DEFAULT_COMPONENT: Record<string, ElementType> = {
  h4: 'h1',
  body1: 'p',
  overline: 'span',
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  { component, variant = 'body1', color = 'inherit', fontWeight, textAlign, letterSpacing, sx, style, children, ...rest },
  ref
) {
  const theme = useTheme()
  const Component = (component ?? TYPOGRAPHY_DEFAULT_COMPONENT[variant] ?? 'span') as ElementType
  const variantStyle = theme.typography[variant] ?? theme.typography.body1
  const base: CSSProperties = {
    fontFamily: theme.typography.fontFamily,
    ...variantStyle,
  }

  if (color === 'text.secondary') {
    base.color = theme.palette.text.secondary
  } else if (color === 'text.primary') {
    base.color = theme.palette.text.primary
  } else if (color !== 'inherit') {
    base.color = color
  }

  if (fontWeight !== undefined) {
    base.fontWeight = fontWeight
  }

  if (textAlign) {
    base.textAlign = textAlign
  }

  if (letterSpacing) {
    base.letterSpacing = letterSpacing
  }

  const mergedStyle = mergeStyles(theme, base, sx, style as CSSProperties | undefined)
  return (
    <Component ref={ref as any} style={mergedStyle} {...rest}>
      {children}
    </Component>
  )
})

interface AlertProps extends Omit<BoxProps, 'component'> {
  severity?: 'success' | 'info' | 'warning' | 'error'
  variant?: 'standard' | 'outlined'
}

function applyAlpha(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized.length === 3 ? sanitized.repeat(2) : sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { severity = 'info', variant = 'standard', sx, style, children, ...rest },
  ref
) {
  const theme = useTheme()
  const paletteColor = theme.palette[severity] ?? theme.palette.info
  const base: CSSProperties = {
    padding: '0.75rem 1rem',
    borderRadius: `${theme.shape.borderRadius}px`,
    border: variant === 'outlined' ? `1px solid ${applyAlpha(paletteColor.main, 0.4)}` : 'none',
    backgroundColor:
      variant === 'outlined' ? applyAlpha(paletteColor.main, 0.08) : applyAlpha(paletteColor.main, 0.16),
    color: paletteColor.main,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  }

  const mergedStyle = mergeStyles(theme, base, sx, style as CSSProperties | undefined)
  return (
    <div ref={ref} role="alert" style={mergedStyle} {...rest}>
      {children}
    </div>
  )
})

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined'
  color?: 'primary' | 'info' | 'inherit'
  size?: 'small' | 'medium' | 'large'
  sx?: SxProps
}

const BUTTON_PADDING: Record<'small' | 'medium' | 'large', string> = {
  small: '0.25rem 0.75rem',
  medium: '0.5rem 1.5rem',
  large: '0.75rem 2rem',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'contained', color = 'primary', size = 'medium', sx, style, children, ...rest },
  ref
) {
  const theme = useTheme()
  const paletteColor = color === 'inherit' ? theme.palette.primary : theme.palette[color] ?? theme.palette.primary
  const base: CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    borderRadius: `${theme.shape.borderRadius}px`,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.button.fontWeight,
    fontSize: theme.typography.button.fontSize,
    letterSpacing: theme.typography.button.letterSpacing,
    lineHeight: theme.typography.button.lineHeight,
    padding: BUTTON_PADDING[size],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  }

  if (variant === 'contained') {
    base.backgroundColor = paletteColor.main
    base.color = paletteColor.contrastText ?? '#ffffff'
    base.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.2)'
  } else {
    base.backgroundColor = 'transparent'
    base.color = paletteColor.main
    base.border = `1px solid ${paletteColor.main}`
  }

  const mergedStyle = mergeStyles(theme, base, sx, style as CSSProperties | undefined)
  return (
    <button ref={ref} style={mergedStyle} {...rest}>
      {children}
    </button>
  )
})

export type { Theme }
