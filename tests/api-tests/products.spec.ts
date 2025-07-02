import { test, expect, request } from '@playwright/test';
import { getFirstProductId, getProductById } from '../Utils';
import { products } from '../config';

test('Get all products via API', async ({ request }) => {
  const response = await request.get('https://api.practicesoftwaretesting.com/products');
  expect(response.status()).toBe(200);
  const body = await response.json();
  const products = Array.isArray(body) ? body : body.data;
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
});

test('Get product by ID via API', async ({ request }) => {
  const firstProductId = await getFirstProductId(request);
  const singleBody = await getProductById(request, firstProductId);
  expect(singleBody).toHaveProperty('id', firstProductId);
});

test('Search for a product by name via API', async ({ request }) => {
  const firstProductName = products[0].name;
  const response = await request.get(`https://api.practicesoftwaretesting.com/products/search?query=${encodeURIComponent(firstProductName)}`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  const productsList = Array.isArray(body) ? body : body.data;
  expect(Array.isArray(productsList)).toBe(true);
  expect(productsList.some(p => p.name === firstProductName)).toBe(true);
});

