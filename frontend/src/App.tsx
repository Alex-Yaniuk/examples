import { Container, Paper, Stack, Typography } from '@mui/material'
import SteamAuthButton from './components/SteamAuthButton'
import SteamProfileCard from './components/SteamProfileCard'
import { useSteamIdentity } from './hooks/useSteamIdentity'
import { useSteamProfile } from './hooks/useSteamProfile'

function App() {
  const { isAuthenticated, steamId, signOut } = useSteamIdentity()
  const { profile, status: profileStatus, error: profileError, refresh } = useSteamProfile(steamId)

  return (
    <Container maxWidth='sm' sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
        <Stack spacing={2} alignItems='center'>
          <Typography variant='h3' component='h1' sx={{ fontWeight: 500 }}>
            Hello, MUI
          </Typography>
          <Typography variant='body1' color='text.secondary' align='center'>
            Welcome to your new React + TypeScript project. Start building something great with Material UI.
          </Typography>
          {isAuthenticated && steamId ? (
            <>
              <Typography variant='body1' align='center'>
                Signed in with your Steam account. Pulling your public profile directly from Steam’s Web API.
              </Typography>
              <SteamProfileCard
                steamId={steamId}
                profile={profile}
                status={profileStatus}
                error={profileError}
                onRetry={refresh}
                onSignOut={signOut}
              />
            </>
          ) : (
            <>
              <Typography variant='body2' color='text.secondary' align='center'>
                Ready to personalize the experience? Connect your Steam account to pull in your profile, library, and more.
              </Typography>
              <SteamAuthButton fullWidth />
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export default App
