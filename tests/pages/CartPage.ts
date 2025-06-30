import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openCart() {
    await this.page.getByRole('link', { name: 'cart' }).click();
  }

  getProductRow(productName: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(productName, 'i') });
  }

  getProductQuantity(productName: string): Locator {
    const row = this.getProductRow(productName);
    return row.getByRole('spinbutton', {
      name: new RegExp('Quantity for ' + productName, 'i'),
    });
  }

  async expectProductVisible(productName: string) {
    const row = this.getProductRow(productName);
    await expect(
      row.getByRole('cell', { name: new RegExp('^' + productName + '$') })
    ).toBeVisible();
  }

  async expectProductQuantity(productName: string, quantity: string) {
    const quantityCell = this.getProductQuantity(productName);
    await expect(quantityCell).toHaveValue(quantity);
  }
}
