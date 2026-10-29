import { test, expect } from '@playwright/test';

test.beforeAll(() => {
  const key = process.env.REQRES_API_KEY?.trim();
  if (!key || key === 'replace_with_your_reqres_api_key') {
    throw new Error(
      'REQRES_API_KEY is missing or still a placeholder. Copy .env.example to .env, '
      + 'set your own ReqRes key locally, then run npm run test:api. Never paste the key into chat.',
    );
  }
});

test('GET /api/users/2 returns 200 and a non-empty email', async ({ request }) => {
  const response = await request.get('/api/users/2');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.email).toEqual(expect.any(String));
  expect(body.data.email.trim().length).toBeGreaterThan(0);
});

test('POST /api/users creates morpheus with status 201', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'morpheus', job: 'leader' },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.name).toBe('morpheus');
});

test('GET /api/users/23 returns 404 for a missing user', async ({ request }) => {
  const response = await request.get('/api/users/23');
  expect(response.status()).toBe(404);
});
