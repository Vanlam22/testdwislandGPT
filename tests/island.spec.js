import { test, expect } from '@playwright/test';
import { islands, HR_HOME } from '../src/data.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.world-loading')).toHaveCount(0);
  await expect(page.locator('.world canvas')).toBeVisible();
});

test('renders eight islands with no runtime errors and moves the character', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('.island-label')).toHaveCount(8);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('典華幸福島✧');
  const marker = page.locator('.player-marker');
  const before = await marker.evaluate(el => parseFloat(el.style.left));
  await page.keyboard.down('ArrowRight');
  await expect.poll(() => marker.evaluate(el => parseFloat(el.style.left))).toBeGreaterThan(before + 4);
  await page.keyboard.up('ArrowRight');
  const initialLabel = await page.locator('[data-island="safety"]').evaluate(el => parseFloat(el.style.left));
  await page.getByRole('button', { name: '放大地圖' }).click();
  await expect.poll(() => page.locator('[data-island="safety"]').evaluate(el => parseFloat(el.style.left))).toBeLessThan(initialLabel - .5);
  await page.getByRole('button', { name: '重設地圖縮放' }).click();
  expect(errors).toEqual([]);
});

test('customizes avatar, validates the name, and persists across reloads', async ({ page }) => {
  await page.getByRole('button', { name: '我的角色', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await page.getByLabel('怎麼稱呼你？').fill(' ');
  await page.getByRole('button', { name: '儲存角色，出發' }).click();
  await expect(page.getByText('請為你的角色取一個名字')).toBeVisible();
  await page.getByLabel('怎麼稱呼你？').fill('小典');
  await page.getByRole('button', { name: '可愛丸子', exact: true }).click();
  await page.getByRole('button', { name: '穿搭顏色 3', exact: true }).click();
  await page.getByRole('button', { name: '膚色 4', exact: true }).click();
  await page.getByRole('button', { name: '儲存角色，出發' }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: '我的角色', exact: true }).click();
  await expect(page.getByLabel('怎麼稱呼你？')).toHaveValue('小典');
  await expect(page.getByRole('button', { name: '可愛丸子', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '穿搭顏色 3', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '膚色 4', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('completes all eight topics only after confirmation and restores progress', async ({ page }) => {
  for (const island of islands) {
    await page.getByRole('button', { name: '探索' + island.name + '：' + island.topic, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: island.name + '：' + island.topic });
    await expect(dialog).toBeVisible();
    const link = dialog.getByRole('link', { name: /前往同仁網站閱讀/ });
    await expect(link).toHaveAttribute('href', HR_HOME);
    await expect(link).toHaveAttribute('target', '_blank');
    const complete = dialog.getByRole('button', { name: '完成這一站的探索' });
    await expect(complete).toBeDisabled();
    await dialog.getByRole('checkbox').check();
    await complete.click();
  }
  await expect(page.getByRole('dialog', { name: '我的探索旅程' })).toBeVisible();
  await expect(page.getByText('典華幸福探索家', { exact: true })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '8');
  await page.reload();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '8');
  await expect(page.locator('.island-label.visited')).toHaveCount(8);
  await page.getByRole('button', { name: '探索初心島：工作守則', exact: true }).click();
  await expect(page.getByText('這份幸福，已經收藏')).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
});

test('mobile directory, touch movement and profile dialog fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: '向右移動' })).toBeVisible();
  const before = await page.locator('.player-marker').evaluate(el => parseFloat(el.style.left));
  const bounds = await page.getByRole('button', { name: '向右移動' }).boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await expect.poll(() => page.locator('.player-marker').evaluate(el => parseFloat(el.style.left))).toBeGreaterThan(before + 2);
  await page.mouse.up();
  await page.getByRole('button', { name: '島嶼目錄', exact: true }).click();
  await page.locator('.island-directory').getByRole('button', { name: /08.*連心島/ }).click();
  await expect(page.getByRole('dialog', { name: '連心島：公務信箱簽名檔' })).toBeVisible();
  await page.getByRole('button', { name: '關閉', exact: true }).click();
  await page.getByRole('button', { name: '我的角色', exact: true }).click();
  const dialogBounds = await page.getByRole('dialog').boundingBox();
  expect(dialogBounds.x).toBeGreaterThanOrEqual(0);
  expect(dialogBounds.x + dialogBounds.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('stored malformed values cannot inject content or fake completed islands', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('denwell-island-v1', JSON.stringify({
    profile: { name: '<script>oops</script>', skin: 'invalid', outfit: 'url(evil)', hairstyle: null },
    completed: ['work', 'work', 'fake-id', null],
  })));
  await page.reload();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('button', { name: '我的角色', exact: true }).click();
  await expect(page.getByLabel('怎麼稱呼你？')).toHaveValue('<script>oops</sc');
  await expect(page.getByRole('button', { name: '俐落短髮', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('script:not([src])').count()).toBe(0);
});
