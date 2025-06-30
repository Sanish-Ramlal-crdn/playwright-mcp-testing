import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get proceedToCheckoutBtn(): Locator {
    return this.page.getByRole("button", { name: "Proceed to checkout" });
  }

  get paymentTypeSelect(): Locator {
    return this.page.locator('select[data-test="payment-method"]');
  }

  get confirmBtn(): Locator {
    return this.page.getByRole("button", { name: "Confirm" });
  }

  get invoiceText(): Locator {
    return this.page.getByText(/^INV-/);
  }

  async proceedToCheckout(times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.proceedToCheckoutBtn.waitFor({
        state: "visible",
        timeout: 10000,
      });
      await this.proceedToCheckoutBtn.click();
    }
  }

  async fillPaymentDetails(paymentData: any) {
    await this.paymentTypeSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.paymentTypeSelect.selectOption(paymentData.type);
    await this.page.getByLabel("Bank name").fill(paymentData.bank_name);
    await this.page.getByLabel("Account name").fill(paymentData.account_name);
    await this.page
      .getByLabel("Account number")
      .fill(paymentData.valid_account_number);
    await this.confirmBtn.click();
  }

  async confirmUntilGone(maxTries: number = 5, waitMs: number = 2000) {
    for (let i = 0; i < maxTries; i++) {
      const visible = await this.confirmBtn.isVisible().catch(() => false);
      if (!visible) return;
      await this.page.waitForTimeout(waitMs);
      if (!(await this.confirmBtn.isVisible().catch(() => false))) return;
      await this.confirmBtn.click();
    }
  }

  async verifyInvoiceVisible(timeout: number = 10000) {
    await expect(this.invoiceText).toBeVisible({ timeout });
  }

  async fillInvalidAccountNo(paymentType: string, accountNumber: string) {
    await this.paymentTypeSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.paymentTypeSelect.selectOption(paymentType);
    await this.page.getByLabel("Account number").fill(accountNumber);
    // Wait for the error message to appear
    await this.page
      .locator(".alert.alert-danger")
      .waitFor({ state: "visible", timeout: 10000 });
  }
}
