import * as React from 'react'

export type Theme = Record<string, unknown>

export const ThemeContext: React.Context<Theme>

export interface ThemeProviderProps {
  theme?: Theme
  children?: React.ReactNode
}

export function ThemeProvider(props: ThemeProviderProps): React.ReactElement
export function CacheProvider(props: { children?: React.ReactNode }): React.ReactElement
export function useTheme<T = Theme>(): T
export function jsx<P>(
  type: React.ElementType<P>,
  props: P & React.Attributes,
  key?: React.Key
): React.ReactElement<P>
export function css(): Record<string, unknown>
export interface GlobalProps {
  styles?: string | Record<string, string | Record<string, string>>
}
export function Global(props: GlobalProps): React.ReactElement | null
