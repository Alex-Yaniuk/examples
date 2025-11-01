import { test, expect } from '@playwright/test'

const headingText = 'Sign in'

const clientIdHint =
  'Configure VITE_GOOGLE_CLIENT_ID to enable Google sign-in.'

test.describe('Sign in screen', () => {
  test('shows the title and configuration hint when Google client ID is missing', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: headingText })).toBeVisible()
    await expect(page.getByText(clientIdHint)).toBeVisible()
  })
})
