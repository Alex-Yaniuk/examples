import { test, expect } from '@playwright/test'

test.describe('Sign in screen', () => {
  test('shows guidance when Google sign-in is disabled', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByRole('alert')).toContainText(
      'Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.',
    )
    await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0)
  })
})
