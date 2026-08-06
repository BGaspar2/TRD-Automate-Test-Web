import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';

test('Flujo E2E - Compra en Pickup usuario anónimo (Ecuador)', async ({ page }) => {
    const homePage = new HomePage(page);
    const menuPage = new MenuPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Navegar y Seleccionar canal Pickup + Tienda
    await homePage.navegar(testData.baseUrl);
    await homePage.seleccionarCanalPickup(testData.location.searchQuery, testData.location.fullAddress);

    // 2. Selección de Categoría y Producto Aleatorio
    await menuPage.seleccionarCategoriaAleatoria();
    await menuPage.seleccionarProductoAleatorio();
    await menuPage.ajustarCantidad(testData.order.desiredQuantity);
    await menuPage.validarYSeleccionarModificadores();
    await menuPage.agregarAlCarrito(testData.order.desiredQuantity);

    // 3. Procesar Carrito e Ir a Pagar
    await cartPage.procesarModalCarrito();
    await cartPage.validarYAjustarMontoCarrito();
    await cartPage.irAPagar();

    // 4. Checkout
    await checkoutPage.iniciarCompletar();
    await checkoutPage.llenarDatosPersonales(testData.customer);
    await checkoutPage.seleccionarMetodoPago(testData.paymentMethodId);

    console.log("Flujo E2E Pickup finalizado con éxito en Ecuador.");
    await page.waitForTimeout(5000);
});
