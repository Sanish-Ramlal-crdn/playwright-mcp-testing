import { Page, Locator, expect } from "@playwright/test";

export class InvoicesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openMyInvoicesMenu() {
    await this.page.locator('[data-test="nav-menu"]').click();
    await this.page.getByRole('link', { name: /my invoices/i }).click();
  }

  async openInvoiceDetails(invoiceNumber: string) {
    const invoiceRow = this.page.locator("tr", {
      has: this.page.locator(`td:has-text(\"${invoiceNumber}\")`),
    });
    await invoiceRow.waitFor({ state: "visible", timeout: 10000 });
    const detailsBtn = invoiceRow.locator("a.btn-primary", { hasText: "Details" });
    await detailsBtn.waitFor({ state: "visible", timeout: 10000 });
    await detailsBtn.click();
  }

  async expectInvoiceTotalToBe(expected: string) {
    const totalLocator = this.page.locator("#total");
    const totalValue = await totalLocator.inputValue();
    await expect(totalValue).toBe(expected);
  }
}
