import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { AuthPage } from "../pages/LoginPage";
import { ProductsPage } from "../pages/ProductsPage";

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
  const proceedToCheckoutBtn = page.getByRole("button", {
    name: "Proceed to checkout",
  });
  await proceedToCheckoutBtn.waitFor({ state: "visible", timeout: 10000 });
  await proceedToCheckoutBtn.click();

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
    const proceedToCheckoutBtn2 = page.getByRole("button", {
      name: "Proceed to checkout",
    });
    await proceedToCheckoutBtn2.waitFor({ state: "visible", timeout: 10000 });
    await proceedToCheckoutBtn2.click();
    didRegister = true;
  }

  // After login or registration, go back to cart and proceed
  if (
    didRegister ||
    (await page.getByRole("button", { name: "Login" }).isVisible())
  ) {
    await page.getByRole("link", { name: "cart" }).click();
  }

  const proceedToCheckoutBtn3 = page.getByRole("button", {
    name: "Proceed to checkout",
  });
  await proceedToCheckoutBtn3.waitFor({ state: "visible", timeout: 10000 });
  await proceedToCheckoutBtn3.click();

  // 7. Click on proceed to checkout (shipping)
  const proceedToCheckoutBtn4 = page.getByRole("button", {
    name: "Proceed to checkout",
  });
  await proceedToCheckoutBtn4.waitFor({ state: "visible", timeout: 10000 });
  await proceedToCheckoutBtn4.click();

  // 9. Select payment type and input payment data, then confirm
  const paymentTypeSelect = await page.locator(
    'select[data-test="payment-method"]'
  );
  await paymentTypeSelect.waitFor({ state: "visible", timeout: 10000 });

  await paymentTypeSelect.selectOption(checkoutData.type);
  await page.getByLabel("Bank name").fill(checkoutData.bank_name);
  await page.getByLabel("Account name").fill(checkoutData.account_name);
  await page
    .getByLabel("Account number")
    .fill(checkoutData.valid_account_number);
  await page.getByRole("button", { name: "Confirm" }).click();
  // 10. Click confirm until the confirm button is no longer visible
  let confirmGone = false;

  for (let i = 0; i < 5; i++) {
    const confirmBtn = page.getByRole("button", { name: "Confirm" });
    if (!(await confirmBtn.isVisible().catch(() => false))) {
      confirmGone = true;
      break;
    }
    await page.waitForTimeout(2000); // Wait a bit before next click
    if (!(await confirmBtn.isVisible().catch(() => false))) {
      confirmGone = true;
      break;
    } else {
      await confirmBtn.click();
    }
  }

  // 11. Verify invoice number
  const invoice = page.getByText(/^INV-/);
  await expect(invoice).toBeVisible({ timeout: 10000 });
});
