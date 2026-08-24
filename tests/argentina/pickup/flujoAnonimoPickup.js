import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

test('Flujo E2E - Compra en Pickup usuario anónimo (Argentina)', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);
    const menuPage = new MenuPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Paso 1: Navegación y Selección de Canal Pickup + Tienda
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegación y Selección de Tienda Pickup',
        descripcion: 'Ingreso al sitio web de KFC Argentina y selección de sucursal para retiro'
    }, async () => {
        await homePage.navegar(testData.baseUrl);
        await homePage.seleccionarCanalPickup(testData.location.searchQuery, testData.location.fullAddress);
    });

    // Paso 2: Selección de Categoría y Producto Aleatorio
    await ejecutarPaso(page, testInfo, {
        numero: 2,
        titulo: 'Selección de Menú y Personalización de Producto',
        descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
    }, async () => {
        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testData.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testData.order.desiredQuantity);
    });

    // Paso 3: Procesar Carrito e Ir a Pagar
    await ejecutarPaso(page, testInfo, {
        numero: 3,
        titulo: 'Revisión y Validación del Carrito de Compras',
        descripcion: 'Verificación de montos mínimos/máximos y avance al checkout'
    }, async () => {
        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();
    });

    // Paso 4: Checkout
    await ejecutarPaso(page, testInfo, {
        numero: 4,
        titulo: 'Datos de Facturación y Selección de Pago',
        descripcion: 'Ingreso de datos del cliente y método de pago en Argentina'
    }, async () => {
        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDatosPersonales(testData.customer);
        await checkoutPage.seleccionarMetodoPago(testData.paymentMethodId);
    });

    console.log("Flujo E2E Pickup finalizado con éxito en Argentina.");
    await page.waitForTimeout(5000);
});
