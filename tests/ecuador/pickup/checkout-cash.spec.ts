import { test, expect } from '@playwright/test';

test.describe('KFC Ecuador - Anonymous Checkout with Cash (Pickup) - DEBUG', () => {
  test.setTimeout(120_000); // 2 minutes for this debug run

  test('step 1: Select Channel and Store', async ({ page }) => {
    
    await test.step('1. Navigate and Select Channel', async () => {
      console.log('🚀 Navigating to KFC Ecuador...');
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      console.log('📍 Selecting RECOGE EN TIENDA...');
      // Using the button that contains the specific text span provided in the HTML
      const pickupBtn = page.locator('button').filter({ has: page.locator('span', { hasText: /^Recoge en Tienda$/i }) }).first();
      await pickupBtn.waitFor({ state: 'visible', timeout: 15000 });
      await pickupBtn.click({ force: true });
      await page.waitForTimeout(2000);
    });
      
    await test.step('2. Select Store (El Inca)', async () => {
      console.log('🔍 Activating Map Mode...');
      // 1. Click the first search input (the trigger)
      const inputs = page.locator('input[placeholder*="Buscar"]').filter({ visible: true });
      await inputs.first().waitFor({ state: 'visible', timeout: 15000 });
      await inputs.first().click();
      
      console.log('🗺️ Map mode activated, waiting for second searcher...');
      await page.waitForTimeout(2000);

      // 2. We use the FIRST visible input (the same one or its replacement in the same spot)
      console.log('⌨️ Typing "El Inca" in the visible searcher...');
      const visibleSearcher = page.locator('input[placeholder*="Buscar"]').filter({ visible: true }).first();
      await visibleSearcher.fill('El Inca');
      await page.waitForTimeout(2000);

      // 3. Click the suggestion
      console.log('👇 Looking for suggestions...');
      const suggestion = page.locator('li.SearchBarItem').filter({ hasText: /El Inca, Quito/i }).first();
      await suggestion.waitFor({ state: 'visible', timeout: 15000 });
      await suggestion.click({ force: true });
      console.log('✅ Suggestion clicked!');
      await page.waitForTimeout(3000);

      console.log('🏪 Clicking on EL INCA store card...');
      const storeCard = page.locator('div, p, span').filter({ hasText: /^EL INCA$/i }).first();
      await storeCard.waitFor({ state: 'visible', timeout: 10000 });
      await storeCard.click({ force: true });
      await page.waitForTimeout(3000);

      console.log('🔘 Checking for final confirmation...');
      const confirmBtn = page.locator('button:has-text("Seleccionar tienda"), button:has-text("Crear nuevo carrito")').first();
      if (await confirmBtn.isVisible({ timeout: 5000 })) {
        await confirmBtn.click({ force: true });
      }
      
      await page.waitForTimeout(5000);
      console.log('✅ Channel and Store selected! Current URL:', page.url());
      expect(page.url()).toContain('menu');
    });

    await test.step('3. Select Category: COMBOS', async () => {
      console.log('🍗 Navigating to COMBOS category...');
      // Looking for the category button. Using a regex for flexibility.
      const categoryCombos = page.locator('button, a, div').filter({ hasText: /^COMBOS$/i }).last();
      await categoryCombos.waitFor({ state: 'visible', timeout: 20000 });
      await categoryCombos.click({ force: true });
      await page.waitForTimeout(4000);
      
      console.log('✅ Category COMBOS selected!');
    });
  });
});
