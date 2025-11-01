import React from 'react'

function styled(Component) {
  return (styles) => {
    const StyledComponent = React.forwardRef((props, ref) => {
      const mergedStyle = { ...props.style }

      if (typeof styles === 'function') {
        Object.assign(mergedStyle, styles(props))
      } else if (styles && typeof styles === 'object') {
        Object.assign(mergedStyle, styles)
      }

      return React.createElement(Component, { ...props, style: mergedStyle, ref })
    })

    StyledComponent.displayName = `Styled(${Component.displayName || Component.name || 'Component'})`

    return StyledComponent
  }
}

const exported = Object.assign(styled, { default: styled })

export default exported
