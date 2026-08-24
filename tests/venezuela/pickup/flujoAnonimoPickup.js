import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

test('Flujo E2E - Seleccionar canal Pickup (Venezuela)', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);

    // Paso 1: Navegación al sitio web
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegación al Portal de KFC',
        descripcion: 'Ingreso al sitio web oficial de KFC Venezuela'
    }, async () => {
        await homePage.navegar(testData.baseUrl);
    });

    // Paso 2: Selección del canal Pickup / Retiro
    await ejecutarPaso(page, testInfo, {
        numero: 2,
        titulo: 'Selección de Canal Pickup',
        descripcion: 'Selección de la modalidad de retiro en tienda física'
    }, async () => {
        await homePage.seleccionarCanalPickup();
    });

    console.log("Canal Pickup seleccionado con éxito en Venezuela.");
    await page.waitForTimeout(3000);
});
