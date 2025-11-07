import { Avatar, Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import type { FC } from 'react'
import type { SteamProfileStatus, SteamProfile } from '../hooks/useSteamProfile'

type SteamProfileCardProps = {
  steamId: string
  onSignOut: () => void
  status: SteamProfileStatus
  profile: SteamProfile | null
  error?: string | null
  onRetry?: () => void
}

const buildFallbackDisplayName = (steamId: string) => `Steam Explorer #${steamId.slice(-4)}`
const buildFallbackAvatar = (steamId: string) => `https://robohash.org/${steamId}.png?set=set3&size=160x160`
const buildFallbackProfileUrl = (steamId: string) => `https://steamcommunity.com/profiles/${steamId}`

const SteamProfileCard: FC<SteamProfileCardProps> = ({ steamId, onSignOut, status, profile, error, onRetry }) => {
  const displayName = profile?.personaName ?? profile?.realName ?? buildFallbackDisplayName(steamId)
  const avatarUrl = profile?.avatarUrl ?? buildFallbackAvatar(steamId)
  const profileUrl = profile?.profileUrl ?? buildFallbackProfileUrl(steamId)

  const helperText = (() => {
    if (status === 'requires-key') return 'Add VITE_STEAM_WEB_API_KEY to load your real Steam profile.'
    if (status === 'error' && error) return error
    if (status === 'loading') return 'Loading your Steam profile...'
    return null
  })()

  return (
    <Card variant='outlined' sx={{ width: '100%', bgcolor: 'background.default' }}>
      <CardContent>
        <Stack spacing={2} alignItems='center'>
          <Avatar src={avatarUrl} alt={displayName} sx={{ width: 96, height: 96 }} />
          <Stack spacing={0.5} alignItems='center'>
            <Typography variant='h6' align='center'>
              {displayName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Steam ID: {steamId}
            </Typography>
            {profile?.countryCode && (
              <Typography variant='caption' color='text.secondary'>
                {profile.countryCode}
              </Typography>
            )}
          </Stack>
          {helperText && (
            <Typography variant='body2' color={status === 'error' || status === 'requires-key' ? 'warning.main' : 'text.secondary'} align='center'>
              {helperText}
            </Typography>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, gap: 1 }}>
        <Button href={profileUrl} target='_blank' rel='noreferrer' variant='text' disabled={!profileUrl}>
          View profile
        </Button>
        <Stack direction='row' spacing={1}>
          {status === 'error' && onRetry && (
            <Button variant='text' onClick={onRetry}>
              Retry
            </Button>
          )}
          <Button variant='outlined' onClick={onSignOut}>
            Sign out
          </Button>
        </Stack>
      </CardActions>
    </Card>
  )
}

export default SteamProfileCard
