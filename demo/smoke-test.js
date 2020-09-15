// Loads the production build in a real browser. A clean build doesn't prove the page works: a dependency that read
// Node's global once compiled and type-checked fine, then crashed on load and left a blank page.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const server = await preview({ logLevel: 'warn' });
const browser = await chromium.launch({ channel: 'chrome' });

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', ({ message }) => errors.push(message));

  await page.goto(server.resolvedUrls.local[0], { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('#root').children.length > 0, null, { timeout: 5000 })
    .catch(() => undefined);
  assert.deepEqual(errors, [], 'the page threw while loading');

  const headings = await page.locator('#root h3').allTextContents();
  assert.deepEqual(
    headings.filter(heading => /\(\d+ rounds?\)$/.test(heading)),
    [ 'B5 (3 rounds)' ],
    'the sample data holds exactly one final'
  );

  const game = page.locator('svg[viewBox="0 0 200 82"]', { hasText: 'West Salem Panthers' }).first();
  const highlightedRows = game.locator('rect[height="22.5"][fill="#222"]');

  await game.getByText('West Salem Panthers').hover();
  assert.equal(await highlightedRows.count(), 1, 'hovering a team highlights its row');

  await page.mouse.move(0, 0);
  assert.equal(await highlightedRows.count(), 0, 'leaving the row clears the highlight');

  console.log('smoke test passed');
} finally {
  await browser.close();
  await server.close();
}
