import { Page, APIRequestContext, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

export async function getFirstProductId(request: APIRequestContext) {
  const productsRes = await request.get(
    "https://api.practicesoftwaretesting.com/products"
  );
  expect(productsRes.status()).toBe(200);
  const productsBody = await productsRes.json();
  const products = Array.isArray(productsBody)
    ? productsBody
    : productsBody.data;
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
  return products[0].id;
}

export async function createCart(request: APIRequestContext) {
  const createCartRes = await request.post(
    "https://api.practicesoftwaretesting.com/carts"
  );
  expect(createCartRes.status()).toBe(201);
  const cartBody = await createCartRes.json();
  expect(cartBody.id).toBeTruthy();
  return cartBody.id;
}

export async function addProductToCart(
  request: APIRequestContext,
  cartId: string,
  productId: string,
  quantity = 1
) {
  const addToCartRes = await request.post(
    `https://api.practicesoftwaretesting.com/carts/${cartId}`,
    {
      data: {
        product_id: productId,
        quantity,
      },
    }
  );
  expect(addToCartRes.status()).toBe(200);
  const addToCartBody = await addToCartRes.json();
  expect(addToCartBody).toHaveProperty("result", "item added or updated");
  return addToCartBody;
}

export async function getProductById(
  request: APIRequestContext,
  productId: string
) {
  const getProductRes = await request.get(
    `https://api.practicesoftwaretesting.com/products/${productId}`
  );
  expect(getProductRes.status()).toBe(200);
  return await getProductRes.json();
}

export function isTokenExpired(tokenData: any) {
  if (!tokenData || !tokenData.access_token || !tokenData.expires_at)
    return true;
  return new Date(tokenData.expires_at) <= new Date();
}

export async function getValidToken(
  request: APIRequestContext,
  userFixturePath = "tests/fixtures/apiUser.json"
) {
  let tokenData;
  const tokenPath = path.resolve(
    process.cwd(),
    userFixturePath.replace("apiUser.json", "token.json")
  );
  try {
    tokenData = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
  } catch {
    tokenData = undefined;
  }
  if (tokenData && !isTokenExpired(tokenData)) {
    return tokenData.access_token;
  }
  // Try login
  const userPath = path.resolve(process.cwd(), userFixturePath);
  const user = JSON.parse(fs.readFileSync(userPath, "utf-8"));
  let loginRes = await request.post(
    "https://api.practicesoftwaretesting.com/users/login",
    {
      data: { email: user.email, password: user.password },
    }
  );
  if (loginRes.status() !== 200) {
    // Register then login
    await request.post(
      "https://api.practicesoftwaretesting.com/users/register",
      { data: user }
    );
    loginRes = await request.post(
      "https://api.practicesoftwaretesting.com/users/login",
      {
        data: { email: user.email, password: user.password },
      }
    );
  }
  expect(loginRes.status()).toBe(200);
  const loginBody = await loginRes.json();
  const token = loginBody.access_token;
  // Save new token
  const expires_in = loginBody.expires_in;
  const expires_at = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : undefined;
  fs.writeFileSync(
    tokenPath,
    JSON.stringify(
      {
        access_token: token,
        expires_in,
        token_type: loginBody.token_type,
        expires_at,
      },
      null,
      2
    )
  );
  return token;
}

export async function loginOrRegisterUI(
  authPage: any,
  user: any,
  urls: any,
  page: Page
) {
  await authPage.goto();
  await authPage.signIn(user.email, user.correct_password);
  if (await authPage.isInvalidCredentialsVisible()) {
    await authPage.register(user);
    await authPage.signIn(user.email, user.correct_password);
  }
  await expect(page).toHaveURL(urls.account, { timeout: 15000 });
}
