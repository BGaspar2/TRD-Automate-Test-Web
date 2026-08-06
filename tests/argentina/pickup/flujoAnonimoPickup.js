import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';

test('Flujo E2E - Seleccionar canal Pickup (Argentina)', async ({ page }) => {
    const homePage = new HomePage(page);

    // 1. Navegar a la web del país
    await homePage.navegar(testData.baseUrl);

    // 2. Seleccionar el canal Pickup / Retiro
    await homePage.seleccionarCanalPickup();

    console.log("Canal Pickup seleccionado con éxito en Argentina.");
    await page.waitForTimeout(3000);
});
