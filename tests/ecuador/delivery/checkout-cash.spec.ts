import { test, expect } from '@playwright/test';

test.describe('KFC Ecuador - Anonymous Checkout with Cash (Delivery) - DEBUG', () => {
  test.setTimeout(120_000);

  test('step 1: Select Channel and Address', async ({ page }) => {
    
    await test.step('1. Navigate and Select Channel', async () => {
      console.log('🚀 Navigating to KFC Ecuador...');
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      console.log('📍 Selecting DOMICILIO...');
      const deliveryBtn = page.getByText(/DOMICILIO/i).first();
      await deliveryBtn.waitFor({ state: 'visible', timeout: 15000 });
      await deliveryBtn.click({ force: true });
      await page.waitForTimeout(3000);
    });

    await test.step('2. Select Address (El Inca, Quito)', async () => {
      console.log('🔍 Activating Address Search...');
      // In delivery, it might already show the input or we need to click "Ingresa tu ubicación"
      const locationTrigger = page.getByText(/Ingresa tu ubicación/i).first();
      if (await locationTrigger.isVisible({ timeout: 5000 })) {
        await locationTrigger.click();
        await page.waitForTimeout(1000);
      }

      const searchInput = page.locator('input[placeholder*="Buscar"]').filter({ visible: true }).first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.click();
      await page.waitForTimeout(1000);

      console.log('⌨️ Typing "El Inca, Quito"...');
      await searchInput.fill('El Inca, Quito');
      await page.waitForTimeout(3000);

      console.log('👇 Selecting suggestion...');
      const suggestion = page.locator('li.SearchBarItem, .SearchBarItem').filter({ hasText: /El Inca, Quito/i }).first();
      await suggestion.waitFor({ state: 'visible', timeout: 10000 });
      await suggestion.click({ force: true });
      await page.waitForTimeout(5000);

      console.log('🔘 Confirming location...');
      const confirmBtn = page.locator('button').filter({ hasText: /Confirmar ubicación/i }).first();
      if (await confirmBtn.isVisible({ timeout: 10000 })) {
          await confirmBtn.click({ force: true });
          await page.waitForTimeout(3000);
      }

      // Handle "Crear nuevo carrito" modal if it appears
      const newCartBtn = page.locator('button').filter({ hasText: /Crear nuevo|Nuevo carrito/i }).first();
      if (await newCartBtn.isVisible({ timeout: 5000 })) {
          console.log('⚠️ Modal "Nuevo carrito" detected, clicking...');
          await newCartBtn.click({ force: true });
          await page.waitForTimeout(3000);
      }
      
      console.log('✅ Channel and Address selected! Current URL:', page.url());
      expect(page.url()).toContain('menu');
    });
  });
});
