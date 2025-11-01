import * as React from 'react'

export type SxValue = string | number | null | undefined | { [key: string]: SxValue }
export type SxProps = SxValue | SxValue[] | Record<string, SxValue>
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

export interface ThemePaletteColor {
  main: string
  contrastText: string
}

export interface ThemePalette {
  background: { default: string }
  primary: ThemePaletteColor
  info: ThemePaletteColor
  text: { primary: string; secondary: string }
  divider: string
  [key: string]: unknown
}

export interface Theme {
  palette: ThemePalette
  shape: { borderRadius: number }
  spacing: (value: number | string) => string | number
  typography: {
    fontFamily: string
    h4: React.CSSProperties
    body1: React.CSSProperties
    overline: React.CSSProperties
    [key: string]: React.CSSProperties | string | number | undefined
  }
  shadows: string[]
  [key: string]: unknown
}

export interface ThemeProviderProps {
  theme?: DeepPartial<Theme>
  children?: React.ReactNode
}

export function createTheme(options?: DeepPartial<Theme>): Theme
export function ThemeProvider(props: ThemeProviderProps): React.ReactElement
export function useTheme(): Theme
export function CssBaseline(): React.ReactElement | null

export interface BoxProps<T extends React.ElementType = 'div'> {
  component?: T
  sx?: SxProps
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Box: <T extends React.ElementType = 'div'>(
  props: BoxProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof BoxProps<T>> & { ref?: React.Ref<Element> }
) => React.ReactElement | null

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  sx?: SxProps
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLDivElement>>

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: number
  square?: boolean
  sx?: SxProps
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Paper: React.ForwardRefExoticComponent<PaperProps & React.RefAttributes<HTMLDivElement>>

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: number | string
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  divider?: React.ReactElement
  sx?: SxProps
  style?: React.CSSProperties
  alignItems?: React.CSSProperties['alignItems']
  justifyContent?: React.CSSProperties['justifyContent']
  textAlign?: React.CSSProperties['textAlign']
  children?: React.ReactNode
}

export const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>>

export type TypographyVariant = 'h4' | 'body1' | 'overline'

export interface TypographyProps<T extends React.ElementType = 'p'> {
  component?: T
  variant?: TypographyVariant
  color?: string
  sx?: SxProps
  style?: React.CSSProperties
  textAlign?: React.CSSProperties['textAlign']
  fontWeight?: React.CSSProperties['fontWeight']
  letterSpacing?: React.CSSProperties['letterSpacing']
  children?: React.ReactNode
}

export const Typography: <T extends React.ElementType = 'p'>(
  props: TypographyProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof TypographyProps<T>> & {
    ref?: React.Ref<Element>
  }
) => React.ReactElement | null

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error'
export type AlertVariant = 'standard' | 'outlined'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  severity?: AlertSeverity
  variant?: AlertVariant
  sx?: SxProps
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>

export type ButtonVariant = 'text' | 'contained' | 'outlined'
export type ButtonColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  sx?: SxProps
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>

export type LinkUnderline = 'none' | 'hover' | 'always'

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  underline?: LinkUnderline
  color?: ButtonColor | 'inherit'
  sx?: SxProps
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>
