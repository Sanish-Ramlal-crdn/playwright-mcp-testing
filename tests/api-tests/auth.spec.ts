import { test, expect, request } from '@playwright/test';
import { getValidToken } from '../Utils';
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
  const token = await getValidToken(request);
  expect(typeof token).toBe('string');
});

test('User login fails with incorrect password', async ({ request }) => {
  const userData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../fixtures/user.json'), 'utf-8')
  );
  const response = await request.post('https://api.practicesoftwaretesting.com/users/login', {
    data: {
      email: userData.email,
      password: userData.incorrect_password
    }
  });
  expect(response.status()).toBe(401);
});

