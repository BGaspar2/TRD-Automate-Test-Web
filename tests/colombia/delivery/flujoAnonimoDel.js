import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';

test('Flujo E2E - Compra a domicilio usuario anónimo (Colombia)', async ({ page }) => {
    const homePage = new HomePage(page);
    const menuPage = new MenuPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Navegación y Ubicación
    await homePage.navegar(testData.baseUrl);
    await homePage.seleccionarCanalDomicilio();
    await homePage.configurarUbicacion(testData.location.searchQuery, testData.location.fullAddress);

    // 2. Selección de Productos y Modificadores
    await menuPage.seleccionarCategoriaAleatoria();
    await menuPage.seleccionarProductoAleatorio();
    await menuPage.ajustarCantidad(testData.order.desiredQuantity);
    await menuPage.validarYSeleccionarModificadores();
    await menuPage.agregarAlCarrito(testData.order.desiredQuantity);

    // 3. Carrito e Inicio de Pago
    await cartPage.procesarModalCarrito();
    await cartPage.validarYAjustarMontoCarrito();
    await cartPage.irAPagar();

    // 4. Checkout y Confirmación de Datos
    await checkoutPage.iniciarCompletar();
    await checkoutPage.llenarDireccionEntrega(testData.deliveryAddress);
    await checkoutPage.llenarDatosPersonales(testData.customer);
    await checkoutPage.seleccionarMetodoPago(testData.paymentMethodId);

    console.log("Flujo de prueba finalizado.");
    await page.waitForTimeout(5000);
});
