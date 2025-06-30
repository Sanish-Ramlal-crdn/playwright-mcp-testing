import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://practicesoftwaretesting.com/');
  }

  async selectProductByName(name: string) {
    await this.page.getByRole('heading', { name }).click();
  }
}
