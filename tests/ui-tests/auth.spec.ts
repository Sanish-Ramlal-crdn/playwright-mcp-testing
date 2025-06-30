import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const user = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/user.json"), "utf-8")
);

test("Sign in or register if needed", async ({ page }) => {
  // Step 1: Go to homepage
  await page.goto("https://practicesoftwaretesting.com/");

  // Step 2: Click on "Sign in"
  await page.getByRole("link", { name: "Sign in" }).click();

  // Step 3: Enter email and correct password from user.json
  await page.getByLabel("Email address *").fill(user.email);
  await page.getByLabel("Password *").fill(user.correct_password);
  await page.getByRole("button", { name: "Login" }).click();

  // Step 4: If error message for invalid credentials, try to register
  if (await page.getByText("Invalid email or password").isVisible()) {
    await page.getByRole("link", { name: "Register your account" }).click();
    await page.getByLabel("First name").fill(user.first_name);
    await page.getByLabel("Last name").fill(user.last_name);
    await page.getByLabel("Date of Birth *").fill(user.dob);
    await page.getByLabel("Street").fill(user.street);
    await page.getByLabel("Postal code").fill(user.postal_code);
    await page.getByLabel("City").fill(user.city);
    await page.getByLabel("State").fill(user.state);
    await page.getByLabel("Country").selectOption({
      label: "United Kingdom of Great Britain and Northern Ireland (the)",
    });
    await page.getByLabel("Phone").fill(user.phone);
    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Password").fill(user.correct_password);
    await page.getByRole("button", { name: "Register" }).click();
    // After registration, try to login again
    await page.getByRole("link", { name: "Sign in" }).click();
    await page.getByLabel("Email address *").fill(user.email);
    await page.getByLabel("Password *").fill(user.correct_password);
    await page.getByRole("button", { name: "Login" }).click();
  }
  // After login, check that the URL is the account page
  await expect(page).toHaveURL("https://practicesoftwaretesting.com/account", {
    timeout: 15000,
  });
});

test("Sign in with incorrect credentials shows error", async ({ page }) => {
  // Step 1: Go to homepage
  await page.goto("https://practicesoftwaretesting.com/");

  // Step 2: Click on "Sign in"
  await page.getByRole("link", { name: "Sign in" }).click();

  // Step 3: Enter incorrect email and incorrect password from user.json
  await page.getByLabel("Email address *").fill(user.incorrect_email);
  await page.getByLabel("Password *").fill(user.incorrect_password);
  await page.getByRole("button", { name: "Login" }).click();

  // Step 4: It should give an error message for invalid credentials
  await expect(page.getByText("Invalid email or password")).toBeVisible();
});
