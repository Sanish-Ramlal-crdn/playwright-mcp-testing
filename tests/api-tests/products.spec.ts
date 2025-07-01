import { test, expect, request } from '@playwright/test';

test('Get all products via API', async ({ request }) => {
  const response = await request.get('https://api.practicesoftwaretesting.com/products');
  expect(response.status()).toBe(200);
  const body = await response.json();
  // Products are under the 'data' property
  const products = Array.isArray(body) ? body : body.data;
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
});
