import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

test('Flujo E2E - Compra a domicilio usuario anónimo (Chile)', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);
    const menuPage = new MenuPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Paso 1: Navegación y Ubicación
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegación y Configuración de Dirección Delivery',
        descripcion: 'Ingreso a KFC Chile y configuración de dirección para entrega a domicilio'
    }, async () => {
        await homePage.navegar(testData.baseUrl);
        await homePage.seleccionarCanalDomicilio();
        await homePage.configurarUbicacion(testData.location.searchQuery, testData.location.fullAddress);
    });

    // Paso 2: Selección de Productos y Modificadores
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

    // Paso 3: Carrito e Inicio de Pago
    await ejecutarPaso(page, testInfo, {
        numero: 3,
        titulo: 'Revisión y Validación del Carrito de Compras',
        descripcion: 'Verificación de montos mínimos/máximos y avance al pago'
    }, async () => {
        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();
    });

    // Paso 4: Checkout y Confirmación de Datos
    await ejecutarPaso(page, testInfo, {
        numero: 4,
        titulo: 'Dirección de Entrega, Datos Personales y Pago',
        descripcion: 'Ingreso de dirección de entrega, datos del cliente y método de pago en Chile'
    }, async () => {
        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDireccionEntrega(testData.deliveryAddress);
        await checkoutPage.llenarDatosPersonales(testData.customer);
        await checkoutPage.seleccionarMetodoPago(testData.paymentMethodId);
    });

    console.log("Flujo Chile Delivery finalizado con éxito.");
    await page.waitForTimeout(5000);
});
