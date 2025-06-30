import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { AuthPage } from "../pages/LoginPage";
import { ProductsPage } from "../pages/ProductsPage";
import { CheckoutPage } from "../pages/CheckoutPage";

const products = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/products.json"), "utf-8")
);
const user = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/user.json"), "utf-8")
);
const checkoutData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/checkout.json"), "utf-8")
);
const urls = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/urls.json"), "utf-8")
);

const firstProductName = products[0].name;

test("Checkout flow with login/registration and payment", async ({ page }) => {
  // 1. Go to homepage
  const productsPage = new ProductsPage(page);
  await productsPage.goto();

  // 2. Click on the first product by name
  await productsPage.selectProductByName(firstProductName);

  // 3. Add the product to the cart
  await page.getByRole("button", { name: "Add to cart" }).click();

  // 4. Click on the cart icon
  await page.getByRole("link", { name: "cart" }).click();

  // 5. Proceed to Checkout
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.proceedToCheckout();

  // 6. Login or register
  const authPage = new AuthPage(page);
  // Directly fill credentials and login (do not click sign in link)
  await authPage.emailInput.fill(user.email);
  await authPage.passwordInput.fill(user.correct_password);
  await authPage.loginButton.click();
  let didRegister = false;
  // Wait up to 5 seconds for invalid credentials message to appear
  let invalidCreds = false;
  try {
    invalidCreds = await authPage.invalidCredentialsText
      .waitFor({ state: "visible", timeout: 5000 })
      .then(
        () => true,
        () => false
      );
  } catch {}
  if (invalidCreds || (await authPage.isInvalidCredentialsVisible())) {
    console.log("invalid credentials, attempting registration...");
    // Click on Register your account link before registration
    await authPage.register(user);
    // After registration, log in to reach the account page
    await authPage.emailInput.fill(user.email);
    await authPage.passwordInput.fill(user.correct_password);
    await authPage.loginButton.click();
    await expect(page).toHaveURL(urls.account, { timeout: 10000 });
    // After login, go to cart and proceed
    await page.getByRole("link", { name: "cart" }).click();
    await checkoutPage.proceedToCheckout();
    didRegister = true;
  }

  // After login or registration, go back to cart and proceed
  if (
    didRegister ||
    (await page.getByRole("button", { name: "Login" }).isVisible())
  ) {
    await page.getByRole("link", { name: "cart" }).click();
  }

  // Proceed through checkout steps (shipping, etc.)
  await checkoutPage.proceedToCheckout(2);

  // Fill payment details and confirm
  await checkoutPage.fillPaymentDetails(checkoutData);

  // Click confirm until gone
  await checkoutPage.confirmUntilGone();

  // Verify invoice
  await checkoutPage.verifyInvoiceVisible();
});

test("Checkout flow with invalid payment data shows error", async ({
  page,
}) => {
  const productsPage = new ProductsPage(page);
  await productsPage.goto();

  // Read first product name from products.json
  await productsPage.selectProductByName(firstProductName);

  // Add the product to the cart
  await page.getByRole("button", { name: "Add to cart" }).click();

  // Click on the cart icon
  await page.getByRole("link", { name: "cart" }).click();

  // Proceed to Checkout
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.proceedToCheckout();

  // Login or register
  const authPage = new AuthPage(page);
  await authPage.emailInput.fill(user.email);
  await authPage.passwordInput.fill(user.correct_password);
  await authPage.loginButton.click();
  let didRegister = false;
  let invalidCreds = false;
  try {
    invalidCreds = await authPage.invalidCredentialsText
      .waitFor({ state: "visible", timeout: 5000 })
      .then(
        () => true,
        () => false
      );
  } catch {}
  if (invalidCreds || (await authPage.isInvalidCredentialsVisible())) {
    // Register and login
    await authPage.register(user);
    await authPage.emailInput.fill(user.email);
    await authPage.passwordInput.fill(user.correct_password);
    await authPage.loginButton.click();
    await expect(page).toHaveURL(urls.account, { timeout: 10000 });
    // After login, go to cart and proceed
    await page.getByRole("link", { name: "cart" }).click();
    await checkoutPage.proceedToCheckout();
    didRegister = true;
  }

  // After login or registration, go back to cart and proceed if needed
  if (
    didRegister ||
    (await page.getByRole("button", { name: "Login" }).isVisible())
  ) {
    await page.getByRole("link", { name: "cart" }).click();
  }

  // Proceed through checkout steps (shipping, etc.)
  await checkoutPage.proceedToCheckout(2);

  // Fill incorrect payment details and wait for error (no need to click confirm)
  const invalidAccountNumber =
    checkoutData.invalid_account_number || "00000000-";
  await checkoutPage.fillInvalidAccountNo(
    checkoutData.type,
    invalidAccountNumber
  );

  // Expect an error message to appear (specific selector for the alert-danger class)
  const errorMsg = page.locator(".alert.alert-danger");
  await expect(errorMsg).toBeVisible({ timeout: 10000 });
  await expect(errorMsg).toContainText("Account number must be numeric");
});
