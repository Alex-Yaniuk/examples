import * as React from 'react'

type StyledFactory = <P extends object>(
  Component: React.ComponentType<P>
) => (
  styles?: React.CSSProperties | ((props: P) => React.CSSProperties)
) => React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<unknown>>

declare const styled: StyledFactory & {
  default: StyledFactory
}

export default styled
