import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function isTokenExpired(tokenData) {
  if (!tokenData || !tokenData.access_token || !tokenData.expires_at) return true;
  return new Date(tokenData.expires_at) <= new Date();
}

test('Create cart, add product, and create invoice via API', async ({ request }) => {
  // 1. Create a cart
  const createCartRes = await request.post('https://api.practicesoftwaretesting.com/carts');
  expect(createCartRes.status()).toBe(201);
  const cartBody = await createCartRes.json();
  const cartId = cartBody.id;
  expect(cartId).toBeTruthy();

  // 2. Get all products and extract the first product ID
  const productsRes = await request.get('https://api.practicesoftwaretesting.com/products');
  expect(productsRes.status()).toBe(200);
  const productsBody = await productsRes.json();
  const products = Array.isArray(productsBody) ? productsBody : productsBody.data;
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
  const firstProductId = products[0].id;

  // 3. Add product to cart
  const addToCartRes = await request.post(`https://api.practicesoftwaretesting.com/carts/${cartId}`, {
    data: {
      product_id: firstProductId,
      quantity: 1
    }
  });
  expect(addToCartRes.status()).toBe(200);
  const addToCartBody = await addToCartRes.json();
  expect(addToCartBody).toHaveProperty('result', 'item added or updated');

  // 4. Ensure valid token before creating invoice
  let tokenData;
  try {
    tokenData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../fixtures/token.json'), 'utf-8'));
  } catch { tokenData = undefined; }
  let token = tokenData && !isTokenExpired(tokenData) ? tokenData.access_token : null;

  if (!token) {
    // Try login
    const user = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../fixtures/apiUser.json'), 'utf-8'));
    let loginRes = await request.post('https://api.practicesoftwaretesting.com/users/login', {
      data: { email: user.email, password: user.password }
    });
    if (loginRes.status() !== 200) {
      // Register then login
      await request.post('https://api.practicesoftwaretesting.com/users/register', { data: user });
      loginRes = await request.post('https://api.practicesoftwaretesting.com/users/login', {
        data: { email: user.email, password: user.password }
      });
    }
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    token = loginBody.access_token;
    // Save new token
    const expires_in = loginBody.expires_in;
    const expires_at = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : undefined;
    fs.writeFileSync(
      path.resolve(__dirname, '../fixtures/token.json'),
      JSON.stringify({ access_token: token, expires_in, token_type: loginBody.token_type, expires_at }, null, 2)
    );
  }

  // --- Swagger UI Authorization Steps ---
  // Visit the Swagger UI
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://api.practicesoftwaretesting.com/api/documentation');
  // Click the Authorize button
  await page.getByRole('button', { name: 'Authorize' }).click();
  // Fill the token in the input box (without 'Bearer ' prefix, Swagger UI adds it automatically)
  await page.getByRole('textbox', { name: 'auth-bearer-value' }).fill(token);
  // Click the Authorize button in the dialog
  await page.getByRole('button', { name: 'Apply credentials' }).click();
  // Optionally close the dialog
  await page.getByRole('button', { name: 'Close' }).click();
  await browser.close();

  // 5. Create invoice using invoice.json fixture, replacing cart_id
  const invoiceFixture = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../fixtures/invoice.json'), 'utf-8')
  );
  invoiceFixture.cart_id = cartId;
  const invoiceRes = await request.post('https://api.practicesoftwaretesting.com/invoices', {
    data: invoiceFixture,
    headers: { Authorization: `Bearer ${token}` }
  });
  expect([200, 201]).toContain(invoiceRes.status());
  const invoiceBody = await invoiceRes.json();
  expect(invoiceBody).toHaveProperty('id');
});
