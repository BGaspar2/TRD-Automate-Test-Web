import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

/**
 * Función base que ejecuta el flujo completo de Pickup en Chile con el método de pago especificado
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {'Tarjeta Débito / Crédito' | 'Efectivo'} metodoPago
 */
async function ejecutarFlujoPickupChile(page, testInfo, metodoPago) {
    test.setTimeout(180000);

    const homePage = new HomePage(page);
    const menuPage = new MenuPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    let codigoPedidoGenerado = null;

    // Paso 1: Navegación y Selección de Canal Pickup + Tienda
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegación y Selección de Tienda Pickup',
        descripcion: 'Ingreso a KFC Chile y selección de local para retiro en tienda'
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

    // Paso 4: Datos del Cliente y Facturación
    await ejecutarPaso(page, testInfo, {
        numero: 4,
        titulo: 'Datos del Cliente y Facturación',
        descripcion: 'Ingreso de datos personales del cliente y verificación de facturación en Chile'
    }, async () => {
        await checkoutPage.iniciarCompletar();
        const datosCliente = (metodoPago === testData.paymentMethods.tarjeta) ? testData.customerTarjeta : testData.customer;
        await checkoutPage.llenarDatosPersonales(datosCliente);
    });

    // Paso 5: Selección de Método de Pago, Procesamiento y Generación de Orden
    await ejecutarPaso(page, testInfo, {
        numero: 5,
        titulo: 'Método de Pago, Procesamiento y Detalle de la Orden',
        descripcion: `Selección de '${metodoPago}', procesamiento de pago y captura de número de orden en Chile`
    }, async () => {
        const parametroPago = (metodoPago === testData.paymentMethods.tarjeta) ? testData.card : null;
        await checkoutPage.seleccionarMetodoPago(metodoPago, parametroPago);
        codigoPedidoGenerado = await checkoutPage.procesarPagoYConfirmarOrden();

        // Registrar metadatos en el informe ejecutivo
        testInfo.annotations.push({
            type: 'Método de Pago',
            description: metodoPago
        });

        if (codigoPedidoGenerado) {
            testInfo.annotations.push({
                type: 'Código de Pedido',
                description: codigoPedidoGenerado
            });
            await testInfo.attach('📋 Código de Pedido Confirmado', {
                body: `Código de Pedido: ${codigoPedidoGenerado}\nMétodo de Pago: ${metodoPago}`,
                contentType: 'text/plain'
            });
        }
    });

    console.log(`✅ Flujo Chile Pickup (${metodoPago}) finalizado exitosamente. Orden: [ ${codigoPedidoGenerado} ]`);
}

// =========================================================================
// 🇨🇱 Casos de Prueba E2E - Métodos de Pago Chile Pickup
// =========================================================================

test('Flujo E2E - Compra Pickup con Tarjeta Débito/Crédito (Chile)', async ({ page }, testInfo) => {
    await ejecutarFlujoPickupChile(page, testInfo, testData.paymentMethods.tarjeta);
});

test('Flujo E2E - Compra Pickup con Efectivo (Chile)', async ({ page }, testInfo) => {
    await ejecutarFlujoPickupChile(page, testInfo, testData.paymentMethods.efectivo);
});
