import { test, expect } from "@playwright/test";
import { user, urls } from "../config";
import { AuthPage } from "../pages/LoginPage.ts";

test("Sign in or register if needed", async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.goto();
  await authPage.signIn(user.email, user.correct_password);

  if (await authPage.isInvalidCredentialsVisible()) {
    await authPage.register(user);
    await authPage.signIn(user.email, user.correct_password);
  }
  await expect(page).toHaveURL(urls.account, {
    timeout: 10000,
  });
});

test("Sign in with incorrect credentials shows error", async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.goto();
  await authPage.signIn(user.incorrect_email, user.incorrect_password);
  await expect(authPage.invalidCredentialsText).toBeVisible();
});
