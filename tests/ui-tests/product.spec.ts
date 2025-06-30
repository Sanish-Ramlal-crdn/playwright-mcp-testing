import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { ProductsPage } from "../pages/ProductsPage";
import { CartPage } from "../pages/CartPage";

const products = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/products.json"), "utf-8")
);
const firstProductName = products[0].name;

test("Add first product to cart and verify", async ({ page }) => {
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);

  // 1. Go to homepage
  await productsPage.goto();

  // 2. Click on the first product by name
  await productsPage.selectProductByName(firstProductName);

  // 3. Add the product to the cart
  await productsPage.addToCart();

  // 4. Click on the cart icon
  await cartPage.openCart();

  // 5. Check if the product has been added to the cart and in the correct quantity
  await cartPage.expectProductVisible(firstProductName);
  await cartPage.expectProductQuantity(firstProductName, "1");
});
