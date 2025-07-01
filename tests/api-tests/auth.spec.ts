import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const user = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/apiUser.json'), 'utf-8')
);

test('User registration via API', async ({ request }) => {
  const response = await request.post('https://api.practicesoftwaretesting.com/users/register', {
    data: user
  });
  expect([201, 422]).toContain(response.status());
  if (response.status() === 201) {
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email', user.email);
  } else if (response.status() === 422) {
    const body = await response.json();
    expect(body).toHaveProperty('email');
    expect(Array.isArray(body.email)).toBe(true);
    expect(body.email[0]).toMatch(/already exists|already registered/i);
  }
});

test('User login via API', async ({ request }) => {
  const response = await request.post('https://api.practicesoftwaretesting.com/users/login', {
    data: {
      email: user.email,
      password: user.password
    }
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty('access_token');
  expect(typeof body.access_token).toBe('string');

  // Store access token and expiry in token.json fixture
  const tokenData = {
    access_token: body.access_token,
    expires_in: body.expires_in,
    token_type: body.token_type,
    // Calculate expiry date/time in ISO format if expires_in is present
    expires_at: body.expires_in ? new Date(Date.now() + body.expires_in * 1000).toISOString() : undefined
  };
  fs.writeFileSync(
    path.resolve(__dirname, '../fixtures/token.json'),
    JSON.stringify(tokenData, null, 2)
  );
});

