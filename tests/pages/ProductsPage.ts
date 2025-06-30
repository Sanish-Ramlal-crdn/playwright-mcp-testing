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
}
