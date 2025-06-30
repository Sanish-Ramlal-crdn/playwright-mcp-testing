import { Page, Locator } from "@playwright/test";
import fs from "fs";
import path from "path";

const urls = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/urls.json"), "utf-8")
);

export class ProductsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(urls.home);
  }

  async selectProductByName(name: string) {
    await this.page.getByRole("heading", { name }).click();
  }

  async addToCart() {
    await this.page.getByRole("button", { name: "Add to cart" }).click();
  }

  async goToCart() {
    await this.page.getByRole("link", { name: "cart" }).click();
  }

  async goToPage(pageNum: number) {
    await this.page.locator(`a[aria-label="Page-${pageNum}"]`).click();
  }

  async expectProductAddedAlert() {
    await this.page
      .getByRole("alert", { name: "Product added to shopping" })
      .waitFor({ timeout: 10000 });
  }
}
