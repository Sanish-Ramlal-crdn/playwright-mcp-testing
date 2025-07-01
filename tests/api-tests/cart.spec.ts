import { test, expect, request } from '@playwright/test';

test('Create cart and add product via API', async ({ request }) => {
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

  // 3. Get product by ID (optional, to verify product exists)
  const getProductRes = await request.get(`https://api.practicesoftwaretesting.com/products/${firstProductId}`);
  expect(getProductRes.status()).toBe(200);

  // 4. Add product to cart (remove 'items' from the URL)
  const addToCartRes = await request.post(`https://api.practicesoftwaretesting.com/carts/${cartId}`, {
    data: {
      product_id: firstProductId,
      quantity: 1
    }
  });
  expect(addToCartRes.status()).toBe(200);
  const addToCartBody = await addToCartRes.json();
  expect(addToCartBody).toHaveProperty('result', 'item added or updated');
});
