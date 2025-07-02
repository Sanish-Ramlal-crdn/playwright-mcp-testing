import { test, expect, request } from "@playwright/test";
import {
  getFirstProductId,
  createCart,
  addProductToCart,
  getProductById,
} from "../Utils";

test("Create cart and add product via API", async ({ request }) => {
  const cartId = await createCart(request);
  const firstProductId = await getFirstProductId(request);
  await getProductById(request, firstProductId);
  await addProductToCart(request, cartId, firstProductId, 1);
});

test("Create cart and get cart details via API", async ({ request }) => {
  const cartId = await createCart(request);
  const getCartRes = await request.get(
    `https://api.practicesoftwaretesting.com/carts/${cartId}`
  );
  expect(getCartRes.status()).toBe(200);
});

test("Create cart, add and delete product via API", async ({ request }) => {
  const cartId = await createCart(request);
  const firstProductId = await getFirstProductId(request);
  await getProductById(request, firstProductId);
  await addProductToCart(request, cartId, firstProductId, 1);
  const deleteRes = await request.delete(
    `https://api.practicesoftwaretesting.com/carts/${cartId}/product/${firstProductId}`
  );
  expect(deleteRes.status()).toBe(204);
});
