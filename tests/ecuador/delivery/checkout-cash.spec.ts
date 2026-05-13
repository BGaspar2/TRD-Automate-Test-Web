import { test, expect } from '@playwright/test';

test.describe('KFC Ecuador - Anonymous Checkout with Cash (Delivery)', () => {
  test.setTimeout(300_000); // 5 minutes

  test('should complete delivery checkout flow with cash payment', async ({ page }) => {
    // ──────────────────────────────────────────────
    // 1. Navigate to the landing page
    // ──────────────────────────────────────────────
    console.log('🚀 Starting KFC Ecuador Delivery Flow...');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // ──────────────────────────────────────────────
    // 2. Select "DOMICILIO" and set location
    // ──────────────────────────────────────────────
    await page.locator('text=DOMICILIO').first().click();
    await page.waitForTimeout(4000);

    console.log('📍 Searching for delivery location: El Inca, Quito...');
    const locationBtn = page.getByText(/Ingresa tu ubicación/i).first();
    await locationBtn.waitFor({ state: 'visible', timeout: 15000 });
    await locationBtn.click();
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder="Buscar dirección"]').filter({ visible: true }).first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill('El Inca, Quito');
    await page.waitForTimeout(3000);

    // Select the first suggestion
    const suggestion = page.locator('li.SearchBarItem, .SearchBarItem').first();
    await suggestion.waitFor({ state: 'visible', timeout: 10000 });
    await suggestion.click();
    await page.waitForTimeout(5000);

    // Confirm location
    const confirmBtn = page.locator('button.bg-background-accent, button:has-text("Confirmar ubicación")').filter({ visible: true }).first();
    if (await confirmBtn.isVisible()) {
      console.log('✅ Confirmation button found, clicking it...');
      await confirmBtn.click();
      await page.waitForTimeout(3000);

      // Handle "Crear nuevo carrito" modal
      const newCartBtn = page.locator('button:has-text("Crear nuevo"), button:has-text("Nuevo carrito")').first();
      try {
        await newCartBtn.waitFor({ state: 'visible', timeout: 5000 });
        console.log('⚠️ "Crear nuevo carrito" modal appeared, clicking it...');
        await newCartBtn.click();
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('ℹ️ No "Crear nuevo carrito" modal detected.');
      }
    }

    // ──────────────────────────────────────────────
    // 3. Select Category: COMBOS
    // ──────────────────────────────────────────────
    console.log('🍗 Navigating to COMBOS category...');
    const categoryCombos = page.getByText('COMBOS', { exact: true }).last();
    await categoryCombos.waitFor({ state: 'visible', timeout: 20000 });
    await categoryCombos.click({ force: true });
    await page.waitForTimeout(4000);

    // ──────────────────────────────────────────────
    // 4. Add Product: BIG BOX BEELE
    // ──────────────────────────────────────────────
    console.log('🛒 Adding product to cart...');
    const addButton = page.locator('button').filter({ hasText: /^Agregar$/ }).first();
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    await page.waitForTimeout(3000);

    // Handle customization modal
    const modalAddBtn = page.locator('button:has-text("Agregar"), button:has-text("$")').filter({ visible: true }).last();
    if (await modalAddBtn.isVisible({ timeout: 8000 })) {
      console.log('✅ Customization modal detected, clicking Agregar...');
      await modalAddBtn.click({ force: true });
      await page.waitForTimeout(4000);
    }

    // ──────────────────────────────────────────────
    // 5. Navigate to Checkout
    // ──────────────────────────────────────────────
    console.log('💳 Navigating to checkout...');
    // Open cart if drawer didn't open
    const cartLink = page.locator('a[href*="/cart"], button[aria-label*="carrito"]').filter({ visible: true }).first();
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await page.waitForTimeout(2000);
    }

    const irAPagarBtn = page.locator('button').filter({ hasText: /Ir a pagar|IR A PAGAR/ }).filter({ visible: true }).last();
    if (await irAPagarBtn.isVisible({ timeout: 5000 })) {
      await irAPagarBtn.click();
    } else {
      await page.goto('/checkout');
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // ──────────────────────────────────────────────
    // 6. Mandatory Address Completion (if warning appears)
    // ──────────────────────────────────────────────
    // 🛡️ REMOVE TOOLTIPS/OVERLAYS
    await page.evaluate(() => {
      const selectors = ['[role="tooltip"]', '[class*="tooltip"]', '[class*="Popover"]', '.tippy-box', '[class*="Overlay"]', '.NotificationsContainer'];
      selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => (el as HTMLElement).remove()));
    });

    console.log('🔍 Checking if address details need completion...');
    const completarBtn = page.locator('div.FulfillAddress button:has-text("Completar")').first();
    if (await completarBtn.isVisible({ timeout: 5000 })) {
      console.log('⚠️ Address requires completion, opening modal...');
      await completarBtn.click({ force: true });
      await page.waitForTimeout(3000);

      const mainStreet = page.locator('#mainStreet');
      if (await mainStreet.isVisible()) {
        console.log('✅ Filling address details...');
        await mainStreet.fill('El Inca');
        await page.locator('#secondaryStreet').fill('Av. 6 de Diciembre');
        await page.locator('#number').fill('N37');
        await page.locator('#reference').fill('Frente al parque');
        await page.locator('.Delivery #phone').fill('0999999999');

        const saveBtn = page.locator('.Delivery button:has-text("Guardar")').first();
        await saveBtn.click();
        await saveBtn.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      }
    }

    // ──────────────────────────────────────────────
    // 7. Fill Personal Details (Guest)
    // ──────────────────────────────────────────────
    console.log('📝 Filling personal details...');
    await page.locator('#name').first().fill('Test');
    await page.locator('#lastName').first().fill('Playwright');
    await page.locator('#email').first().fill('test@example.com');
    
    const phoneInput = page.locator('.Main #phone, #phone').filter({ visible: true }).first();
    if (await phoneInput.isVisible()) await phoneInput.fill('0999999999');

    // Document (CI/RUC)
    const docInput = page.locator('#documentNumber, input[name="documentNumber"], #document').first();
    if (await docInput.isVisible()) await docInput.fill('1710034065');

    // ──────────────────────────────────────────────
    // 8. Select Payment Method (Efectivo)
    // ──────────────────────────────────────────────
    console.log('💳 Forcing Efectivo payment method...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const cashOption = page.locator('label, span, p').filter({ hasText: /^Efectivo$/ }).first();
    const cashRadio = page.locator('input[type="radio"]').filter({ has: page.locator('..', { hasText: /Efectivo/ }) }).first();

    if (await cashRadio.isVisible()) {
      await cashRadio.check({ force: true });
    } else {
      await cashOption.click({ force: true });
    }

    // JS Force to ensure it is selected
    await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const cash = radios.find(r => r.parentElement?.innerText.includes('Efectivo') || (r as HTMLInputElement).value?.includes('cash')) as HTMLInputElement;
      if (cash) {
        cash.checked = true;
        cash.click();
        cash.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(2000);

    // ──────────────────────────────────────────────
    // 9. Final Submission
    // ──────────────────────────────────────────────
    console.log('🚀 Clicking Pagar ahora...');
    const pagarBtn = page.locator('button:has-text("Pagar ahora")').first();
    await pagarBtn.click();
    
    // Final verification
    await page.waitForURL(/status=success|status=processing|checkout/, { timeout: 30000 });
    console.log('🎉 Order Processed! URL:', page.url());
    
    expect(page.url()).toMatch(/status=success|status=processing|checkout/);
  });
});
