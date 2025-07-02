import { test, expect } from "@playwright/test";
import { products, user, checkout, urls } from "../config";
import { AuthPage } from "../pages/LoginPage";
import { ProductsPage } from "../pages/ProductsPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { InvoicesPage } from "../pages/InvoicesPage";
import { CartPage } from "../pages/CartPage";
import { loginOrRegisterUI } from "../Utils";

const firstProductName = products[0].name;

test("Checkout flow with login/registration and payment", async ({ page }) => {
  const productsPage = new ProductsPage(page);
  await productsPage.goto();
  await productsPage.selectProductByName(firstProductName);
  await productsPage.addToCart();
  await productsPage.goToCart();
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.proceedToCheckout();
  const authPage = new AuthPage(page);
  await loginOrRegisterUI(authPage, user, urls, page);
  await productsPage.goToCart();
  await checkoutPage.proceedToCheckout(2);
  await checkoutPage.fillPaymentDetails(checkout);
  await checkoutPage.confirmUntilGone();
  await checkoutPage.verifyInvoiceVisible();
});

test("Checkout flow with invalid payment data shows error", async ({
  page,
}) => {
  const productsPage = new ProductsPage(page);
  await productsPage.goto();
  await productsPage.selectProductByName(firstProductName);
  await productsPage.addToCart();
  await productsPage.goToCart();
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.proceedToCheckout();
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
    await authPage.register(user);
    await authPage.emailInput.fill(user.email);
    await authPage.passwordInput.fill(user.correct_password);
    await authPage.loginButton.click();
    await expect(page).toHaveURL(urls.account, { timeout: 10000 });
    await productsPage.goToCart();
    await checkoutPage.proceedToCheckout();
    didRegister = true;
  }
  if (
    didRegister ||
    (await checkoutPage.page.getByRole("button", { name: "Login" }).isVisible())
  ) {
    await productsPage.goToCart();
  }
  await checkoutPage.proceedToCheckout(2);
  const invalidAccountNumber =
    checkout.invalid_account_number || "00000000-";
  await checkoutPage.fillInvalidAccountNo(
    checkout.type,
    invalidAccountNumber
  );
  const errorMsg = page.locator(".alert.alert-danger");
  await expect(errorMsg).toBeVisible({ timeout: 10000 });
  await expect(errorMsg).toContainText("Account number must be numeric");
});

test("Checkout flow with all products, total cost, and invoice verification", async ({
  page,
}) => {
  const productsPage = new ProductsPage(page);
  await productsPage.goto();
  const productNames = products.map((p: any) => p.name);
  const productPrices = Object.fromEntries(
    products.map((p: any) => [p.name, parseFloat(p.price)])
  );
  let totalCost = 0;
  for (let i = 0; i < productNames.length; i++) {
    const name = productNames[i];
    let found = false;
    if (i === productNames.length - 1) {
      await productsPage.goToPage(2);
      await page.waitForTimeout(500);
    }
    for (let pageNum = 1; pageNum <= 5 && !found; pageNum++) {
      if (i !== productNames.length - 1 && pageNum > 1) {
        await productsPage.goToPage(pageNum);
      }
      try {
        await productsPage.selectProductByName(name);
        await productsPage.addToCart();
        totalCost += productPrices[name];
        await productsPage.expectProductAddedAlert();
        await productsPage.goto();
        found = true;
      } catch {}
    }
  }
  await productsPage.goToCart();
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.proceedToCheckout();
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
    await authPage.register(user);
    await authPage.emailInput.fill(user.email);
    await authPage.passwordInput.fill(user.correct_password);
    await authPage.loginButton.click();
    await expect(page).toHaveURL(urls.account, { timeout: 10000 });
    await productsPage.goToCart();
    await checkoutPage.proceedToCheckout();
    didRegister = true;
  }
  if (
    didRegister ||
    (await checkoutPage.page.getByRole("button", { name: "Login" }).isVisible())
  ) {
    await productsPage.goToCart();
  }
  await checkoutPage.proceedToCheckout(2);
  await checkoutPage.fillPaymentDetails(checkout);
  await checkoutPage.confirmUntilGone();
  const invoiceLocator = checkoutPage.invoiceText;
  await expect(invoiceLocator).toBeVisible({ timeout: 10000 });
  const invoiceNumber = await invoiceLocator.textContent();
  const invoicesPage = new InvoicesPage(page);
  await invoicesPage.openMyInvoicesMenu();
  await invoicesPage.openInvoiceDetails(invoiceNumber!);
  await invoicesPage.expectInvoiceTotalToBe(`$ ${totalCost.toFixed(2)}`);
});
