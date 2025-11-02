import { Container, Paper, Stack, Typography } from '@mui/material'

function App() {
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
        </Stack>
      </Paper>
    </Container>
  )
}

export default App
