import { Button, SvgIcon, type ButtonProps } from '@mui/material'
import { useMemo } from 'react'

const STEAM_OPENID_ENDPOINT = 'https://steamcommunity.com/openid/login'
const OPEN_ID_NS = 'http://specs.openid.net/auth/2.0'

type SteamAuthButtonProps = ButtonProps<'button'>

const buildSteamRedirectUrl = (returnTo: string, realm: string) => {
  const url = new URL(STEAM_OPENID_ENDPOINT)
  const params = new URLSearchParams({
    'openid.ns': OPEN_ID_NS,
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': realm,
    'openid.identity': `${OPEN_ID_NS}/identifier_select`,
    'openid.claimed_id': `${OPEN_ID_NS}/identifier_select`,
  })
  url.search = params.toString()
  return url.toString()
}

const getDefaultReturnUrl = () => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/auth/steam/callback`
}

const getRealmFromUrl = (targetUrl: string) => {
  try {
    return new URL(targetUrl).origin
  } catch {
    return targetUrl
  }
}

const SteamGlyph = () => (
  <SvgIcon viewBox='0 0 24 24' sx={{ fontSize: 20 }}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2.41 14.915A10.014 10.014 0 0011.99 22C17.517 22 22 17.523 22 12S17.518 2 11.99 2C6.683 2 2.342 6.123 2 11.336l.007.01v-.004l5.38 2.211a2.748 2.748 0 011.641-.454l2.45-3.554c-.002-.016-.002-.033-.002-.05a3.808 3.808 0 013.803-3.804 3.807 3.807 0 013.802 3.804 3.808 3.808 0 01-3.802 3.806l-.086-.002-3.505 2.502a2.778 2.778 0 01-3.844 2.637 2.771 2.771 0 01-1.64-1.96L2.41 14.916zm5.678 2.938a2.144 2.144 0 002.804-2.794 2.125 2.125 0 00-1.156-1.162 2.13 2.13 0 00-1.58-.024l1.28.53a1.577 1.577 0 11-1.213 2.912l-1.238-.513c.22.458.6.841 1.103 1.05zm4.657-8.358a2.537 2.537 0 002.534 2.536 2.538 2.538 0 002.534-2.536 2.538 2.538 0 00-2.534-2.535 2.537 2.537 0 00-2.534 2.535zm2.538-1.909a1.904 1.904 0 000 3.81 1.904 1.904 0 000-3.81z'
    />
  </SvgIcon>
)

function SteamAuthButton(props: SteamAuthButtonProps) {
  const defaultReturnUrl = useMemo(() => getDefaultReturnUrl(), [])
  const returnTo = import.meta.env.VITE_STEAM_RETURN_URL || defaultReturnUrl
  const realm = import.meta.env.VITE_STEAM_REALM || getRealmFromUrl(returnTo)

  const steamRedirectUrl = useMemo(() => {
    if (!returnTo || !realm) return ''
    return buildSteamRedirectUrl(returnTo, realm)
  }, [realm, returnTo])

  const handleClick = () => {
    if (!steamRedirectUrl) return
    window.location.href = steamRedirectUrl
  }

  return (
    <Button
      variant='contained'
      startIcon={<SteamGlyph />}
      onClick={handleClick}
      disabled={!steamRedirectUrl}
      sx={{
        alignSelf: 'stretch',
        backgroundColor: '#171a21',
        '&:hover': { backgroundColor: '#1b2838' },
      }}
      {...props}
    >
      Sign in with Steam
    </Button>
  )
}

export default SteamAuthButton
