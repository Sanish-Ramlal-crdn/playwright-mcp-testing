import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const products = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixtures/products.json"), "utf-8")
);
const firstProductName = products[0].name;

test("Add first product to cart and verify", async ({ page }) => {
  // 1. Go to homepage
  await page.goto("https://practicesoftwaretesting.com/");

  // 2. Click on the first product by name
  await page.getByRole("heading", { name: firstProductName }).click();

  // 3. Add the product to the cart
  await page.getByRole("button", { name: "Add to cart" }).click();

  // 4. Click on the cart icon
  await page.getByRole("link", { name: "cart" }).click();

  // 5. Check if the product has been added to the cart and in the correct quantity
  const row = page.getByRole("row", {
    name: new RegExp(firstProductName, "i"),
  });
  await expect(
    row.getByRole("cell", { name: new RegExp("^" + firstProductName + "$") })
  ).toBeVisible();
  const quantityCell = row.getByRole("spinbutton", {
    name: new RegExp("Quantity for " + firstProductName, "i"),
  });
  await expect(quantityCell).toHaveValue("1");
});
