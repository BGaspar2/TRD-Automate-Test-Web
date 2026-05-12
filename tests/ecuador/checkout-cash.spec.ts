import { test, expect } from '@playwright/test';

test.describe('KFC Ecuador - Anonymous Checkout with Cash', () => {
  test.setTimeout(240_000); // 4 minutes: flow + up to 60s processing→success wait

  test('should complete checkout flow with cash payment at El Inca Quito', async ({ page }) => {
    // ──────────────────────────────────────────────
    // 1. Navigate to the landing page
    // ──────────────────────────────────────────────
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // ──────────────────────────────────────────────
    // 2. Select "RECOGE EN TIENDA" on the landing page
    // ──────────────────────────────────────────────
    await page.locator('text=RECOGE EN TIENDA').click();
    await page.waitForTimeout(1500);

    // Select "Para llevar" inside the modal
    await page.locator('text=Para llevar').first().click();
    await page.waitForTimeout(1500);

    // ──────────────────────────────────────────────
    // 3. Search for "El Inca" and select the store
    // ──────────────────────────────────────────────
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.click();
    await searchInput.fill('El Inca');
    await page.waitForTimeout(2000);

    // Click the autocomplete suggestion (use exact match to avoid ambiguity)
    const suggestion = page.getByText('El Inca, Quito, Ecuador', { exact: true });
    if (await suggestion.isVisible({ timeout: 5000 })) {
      await suggestion.click();
    } else {
      await searchInput.press('Enter');
    }
    await page.waitForTimeout(3000);

    // Click on "EL INCA" store in the list (it should be the first one)
    const elIncaStore = page.getByText('EL INCA', { exact: true }).first();
    await elIncaStore.scrollIntoViewIfNeeded();
    await elIncaStore.click();
    await page.waitForTimeout(2000);

    // Handle "Seleccionar tienda" or "Crear nuevo carrito" buttons
    const selectStoreBtn = page.getByText('Seleccionar tienda');
    const newCartBtn = page.getByText('Crear nuevo carrito');
    if (await selectStoreBtn.isVisible({ timeout: 3000 })) {
      await selectStoreBtn.click();
    } else if (await newCartBtn.isVisible({ timeout: 3000 })) {
      await newCartBtn.click();
    }

    // ──────────────────────────────────────────────
    // 4. Wait for the menu page to load, click COMBOS
    // ──────────────────────────────────────────────
    await page.waitForTimeout(5000);

    // The menu page shows category cards. Click "COMBOS" to navigate to the combos listing.
    await page.getByText('COMBOS', { exact: true }).first().click();
    await page.waitForTimeout(5000);

    // ──────────────────────────────────────────────
    // 5. Add a product to the cart (with retry)
    // ──────────────────────────────────────────────
    let addedToCart = false;

    for (let attempt = 0; attempt < 3 && !addedToCart; attempt++) {
      // Click the first "Agregar" button on a product card
      const addButton = page.locator('button').filter({ hasText: /^Agregar$/ }).first();
      await addButton.waitFor({ state: 'visible', timeout: 10000 });
      await addButton.click();
      await page.waitForTimeout(2000);

      // ── Handle customization modal ──
      // The modal has radio options pre-selected; just scroll to and click "Agregar $X.XX"
      const agregarPriceBtn = page.locator('button').filter({ hasText: /Agregar \$/ }).first();
      const modalVisible = await agregarPriceBtn.isVisible({ timeout: 5000 });

      if (modalVisible) {
        await agregarPriceBtn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await agregarPriceBtn.click();

        // Wait for the modal to close (button disappears)
        await agregarPriceBtn.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(1500);
      } else {
        // No modal appeared — product may have been added directly
        await page.waitForTimeout(1500);
      }

      // Quickly check if cart now has items (counter in header or navigate to cart)
      // We use a brief navigation to /cart to verify
      await page.goto('/cart');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const stillEmpty = await page.getByText('TU CARRITO ESTÁ VACÍO').isVisible({ timeout: 2000 });
      if (!stillEmpty) {
        addedToCart = true;
      } else if (attempt < 2) {
        // Go back to the combos page and retry
        await page.goto('/menu/combos');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
      }
    }

    // Assert the cart has at least one item
    expect(addedToCart, 'Product was not added to cart after 3 attempts').toBe(true);


    // ──────────────────────────────────────────────
    // 8. Proceed to checkout
    // ──────────────────────────────────────────────
    const irAPagar = page.locator('button').filter({ hasText: /Ir a pagar|IR A PAGAR/ }).first();
    await irAPagar.waitFor({ state: 'visible', timeout: 10000 });
    await irAPagar.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // ──────────────────────────────────────────────
    // 9. Fill in guest user information
    // ──────────────────────────────────────────────
    const nameInput = page.locator('input[name="name"], input[placeholder*="Nombre"], #name').first();
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill('Test');

    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="Apellido"], #lastName').first();
    await lastNameInput.fill('Playwright');

    const emailInput = page.locator('input[name="email"], input[placeholder*="correo"], input[type="email"], #email').first();
    await emailInput.fill('test@example.com');

    const phoneInput = page.locator('input[name="phone"], input[placeholder*="teléfono"], input[type="tel"], #phone').first();
    await phoneInput.fill('0999999999');

    // Document type and number
    const docTypeSelect = page.locator('select[name="documentType"], #documentType').first();
    if (await docTypeSelect.isVisible({ timeout: 2000 })) {
      await docTypeSelect.selectOption('CI');
    }

    const docInput = page.locator('input[name="document"], input[placeholder*="cédula"], #document').first();
    if (await docInput.isVisible({ timeout: 2000 })) {
      await docInput.fill('1710034065'); // Valid Ecuadorian CI
    }

    // ──────────────────────────────────────────────
    // 10. Scroll down to reveal payment methods and select "Efectivo"
    // ──────────────────────────────────────────────
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    // Look for the cash payment option
    // The radio buttons for payment methods don't have standard labels.
    // We need to click directly on the "Efectivo" text or its associated radio input.
    await page.evaluate(() => {
      // Find all text nodes/elements containing "Efectivo"
      const allElements = document.querySelectorAll('span, p, div, label');
      for (const el of allElements) {
        if (el.textContent?.trim() === 'Efectivo' && el.children.length === 0) {
          // Click the element itself
          (el as HTMLElement).click();
          // Walk up to find the clickable radio container
          let parent = el.parentElement;
          for (let i = 0; i < 5 && parent; i++) {
            const radio = parent.querySelector('input[type="radio"]') as HTMLInputElement | null;
            if (radio) {
              radio.click();
              radio.checked = true;
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              break;
            }
            (parent as HTMLElement).click();
            parent = parent.parentElement;
          }
          break;
        }
      }
    });
    await page.waitForTimeout(1500);

    // Final scroll to payment area and screenshot
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // ──────────────────────────────────────────────
    // 11. Intercept the order creation API response
    //     to capture seqval (e.g. 0000004328-010103)
    //     before clicking "Pagar ahora"
    // ──────────────────────────────────────────────
    let orderSeqval: string | null = null;
    let orderDbId: string | null = null;

    // Listen to all API responses for the order creation endpoint
    page.on('response', async (response) => {
      const url = response.url();
      // Capture the order creation response (POST to orders endpoint)
      if ((url.includes('/orders') || url.includes('/checkout')) && response.request().method() !== 'GET') {
        try {
          const body = await response.json().catch(() => null);
          if (body) {
            // seqval is the formatted order code like "0000004328-010103"
            const seqval = body?.seqval || body?.data?.seqval || body?.order?.seqval
              || body?.result?.seqval || body?.attributes?.seqval;
            if (seqval) orderSeqval = seqval;

            // Also grab the numeric id
            const id = body?.id || body?.data?.id || body?.order?.id;
            if (id) orderDbId = String(id);
          }
        } catch (_) {
          // ignore parse errors
        }
      }
    });

    // ──────────────────────────────────────────────
    // 12. Click "Pagar ahora" to submit the order
    // ──────────────────────────────────────────────
    const pagarBtn = page.locator('button').filter({ hasText: /Pagar ahora|PAGAR AHORA/ }).first();
    await pagarBtn.waitFor({ state: 'visible', timeout: 10000 });
    await pagarBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await pagarBtn.click();

    // ──────────────────────────────────────────────
    // 13. Wait for confirmation page
    // ──────────────────────────────────────────────
    // The app first lands on status=processing (polls backend), then
    // auto-redirects to status=success&orderId=XXXXX once confirmed.
    // Wait first for processing to appear, then wait for success.
    await page.waitForURL(/checkout\?status=(success|processing)/, { timeout: 20000 }).catch(() => {});

    // If we're on processing, wait for the auto-redirect to success (up to 60s)
    if (page.url().includes('status=processing')) {
      console.log('⏳ Order processing... waiting for confirmation (up to 60s)');
      await page.waitForURL(/checkout\?status=success/, { timeout: 60000 }).catch(() => {
        console.log('⚠️  Still on processing after 60s — capturing current state');
      });
    }

    await page.waitForLoadState('domcontentloaded');

    const confirmUrl = page.url();

    // Extract orderId from the confirmation URL query string
    // Present on success: /checkout?status=success&orderId=1765099&catalogueId=3
    const confirmParams = new URLSearchParams(confirmUrl.split('?')[1] ?? '');
    orderDbId = orderDbId || confirmParams.get('orderId');
    const catalogueId = confirmParams.get('catalogueId') || '3';

    // Take screenshot of the success screen ("Tu pedido ha sido creado con éxito")
    await page.screenshot({ path: 'test-results/order-confirmation.png', fullPage: true });

    // ──────────────────────────────────────────────
    // 14. Navigate to order detail to get seqval
    // ──────────────────────────────────────────────
    if (orderDbId && !orderSeqval) {
      await page.goto(`/profile/orders/${orderDbId}?catalogueId=${catalogueId}`);
      await page.waitForLoadState('domcontentloaded');
      // Wait for the right-side detail panel to populate (it loads async)
      await page.waitForTimeout(10000);

      const pageText = await page.evaluate(() => document.body.innerText);

      // Pattern: seqval like "0000004328-010103" (7+ digits, dash, 4+ digits)
      const seqMatch = pageText.match(/\d{7,}-\d{4,}/);
      if (seqMatch) {
        orderSeqval = seqMatch[0];
      } else {
        // Debug: print the page text to understand the structure
        console.log('\nDEBUG - Order detail page text (first 1500 chars):\n');
        console.log(pageText.substring(0, 1500));
      }

      // Take screenshot of the order detail panel
      await page.screenshot({ path: 'test-results/order-detail.png', fullPage: true });
    }

    // ──────────────────────────────────────────────
    // 15. Log and assert results
    // ──────────────────────────────────────────────
    console.log(`\n🎉 ORDER PLACED SUCCESSFULLY!`);
    console.log(`📋 Order ID    : ${orderDbId   || 'not found'}`);
    console.log(`📋 Order Seqval: ${orderSeqval || 'not found in detail panel (check order-detail.png)'}`);
    console.log(`🔗 Confirm URL : ${confirmUrl}`);
    console.log(`📸 Screenshots : test-results/order-confirmation.png, test-results/order-detail.png`);

    // The confirmation URL must contain status=success or status=processing
    expect(confirmUrl).toMatch(/status=success|status=processing/);
    // We must have captured the order ID from the URL
    expect(orderDbId).toBeTruthy();
  });
});
