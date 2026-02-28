// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('API integration', () => {

  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('questions API returns questions', async ({ request }) => {
    const res = await request.get('/api/questions');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.questions).toBeDefined();
    expect(body.questions.length).toBeGreaterThan(0);
  });

  test('answer submission returns correct score', async ({ request }) => {
    const res = await request.post('/api/answers', {
      data: {
        answers: { '1': 0, '2': 2, '3': 3, '4': 2, '5': 1, '6': 2, '7': 2, '8': 2, '9': 1, '10': 3 }
      }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.percentage).toBe(100);
  });
});
