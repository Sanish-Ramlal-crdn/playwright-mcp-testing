import { test, expect } from "@playwright/test";
import { user, urls } from "../config";
import { AuthPage } from "../pages/LoginPage.ts";
import { loginOrRegisterUI } from "../Utils";

test("Sign in or register if needed", async ({ page }) => {
  const authPage = new AuthPage(page);
  await loginOrRegisterUI(authPage, user, urls, page);
});

test("Sign in with incorrect credentials shows error", async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.goto();
  await authPage.signIn(user.incorrect_email, user.incorrect_password);
  await expect(authPage.invalidCredentialsText).toBeVisible();
});
