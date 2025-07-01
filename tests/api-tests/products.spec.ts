import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Get all products via API', async ({ request }) => {
  const response = await request.get('https://api.practicesoftwaretesting.com/products');
  expect(response.status()).toBe(200);
  const body = await response.json();
  // Products are under the 'data' property
  const products = Array.isArray(body) ? body : body.data;
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
});

test('Get product by ID via API', async ({ request }) => {
  // Get all products
  const allResponse = await request.get('https://api.practicesoftwaretesting.com/products');
  expect(allResponse.status()).toBe(200);
  const allBody = await allResponse.json();
  const products = Array.isArray(allBody) ? allBody : allBody.data;
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
  const firstProductId = products[0].id;

  // Get product by ID
  const singleResponse = await request.get(`https://api.practicesoftwaretesting.com/products/${firstProductId}`);
  expect(singleResponse.status()).toBe(200);
  const singleBody = await singleResponse.json();
  expect(singleBody).toHaveProperty('id', firstProductId);
});

test('Search for a product by name via API', async ({ request }) => {
  // Read the first product name from products.json fixture
  const productsFixture = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../fixtures/products.json'), 'utf-8')
  );
  const firstProductName = productsFixture[0].name;

  // Make GET request to search endpoint with query param
  const response = await request.get(`https://api.practicesoftwaretesting.com/products/search?query=${encodeURIComponent(firstProductName)}`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  // Products are under the 'data' property
  const products = Array.isArray(body) ? body : body.data;
  expect(Array.isArray(products)).toBe(true);
  // Optionally, check that at least one result matches the search
  expect(products.some(p => p.name === firstProductName)).toBe(true);
});

