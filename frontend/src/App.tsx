import { useRef } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useGoogleSignIn } from './features/auth/useGoogleSignIn'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const { email, status, error, signOut, retry } = useGoogleSignIn({
    clientId,
    buttonContainer: buttonContainerRef,
  })

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5',
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 360,
          borderRadius: 3,
          p: 3,
        }}
      >
        <Stack spacing={2} alignItems="stretch">
          <Typography component="h1" variant="h5" textAlign="center" fontWeight={600}>
            Sign in
          </Typography>

          {!clientId && (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={retry}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {email ? (
            <Stack spacing={2} alignItems="center">
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="overline" color="text.secondary">
                  Signed in as
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  textAlign="center"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {email}
                </Typography>
              </Stack>
              <Button variant="contained" onClick={signOut} sx={{ borderRadius: 999 }}>
                Sign out
              </Button>
            </Stack>
          ) : (
            <Box
              ref={buttonContainerRef}
              sx={{
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {status === 'loading' && <CircularProgress size={20} />}
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}

export default App
