import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

/**
 * Función base que ejecuta el flujo completo de Delivery en Venezuela con el método de pago especificado
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {'Punto de Venta' | 'Efectivo (Monto Exacto)' | 'Efectivo (Con Cambio)'} metodoPago
 */
async function ejecutarFlujoDeliveryVenezuela(page, testInfo, metodoPago) {
    test.setTimeout(180000);

    const homePage = new HomePage(page);
    const menuPage = new MenuPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    let codigoPedidoGenerado = null;

    // Paso 1: Navegación y Ubicación
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegación y Configuración de Dirección Delivery',
        descripcion: 'Ingreso a KFC Venezuela y configuración de dirección para entrega a domicilio'
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
        descripcion: 'Verificación de montos mínimos/máximos y avance al checkout'
    }, async () => {
        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();
    });

    // Paso 4: Dirección de Entrega y Datos Personales
    await ejecutarPaso(page, testInfo, {
        numero: 4,
        titulo: 'Dirección de Entrega y Datos del Cliente',
        descripcion: 'Llenado de dirección de entrega detallada y datos personales del cliente'
    }, async () => {
        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDireccionEntrega(testData.deliveryAddress);
        await checkoutPage.llenarDatosPersonales(testData.customer);
    });

    // Paso 5: Selección de Método de Pago, Procesamiento y Generación de Orden
    await ejecutarPaso(page, testInfo, {
        numero: 5,
        titulo: 'Método de Pago, Procesamiento y Detalle de la Orden',
        descripcion: `Selección de '${metodoPago}', procesamiento de pago y captura de número de orden`
    }, async () => {
        await checkoutPage.seleccionarMetodoPago(metodoPago, testData.montoCambio);
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

    console.log(`✅ Flujo Venezuela Delivery (${metodoPago}) finalizado exitosamente. Orden: [ ${codigoPedidoGenerado} ]`);
}

// =========================================================================
// 🇻🇪 Casos de Prueba E2E - Métodos de Pago Venezuela
// =========================================================================

test('Flujo E2E - Compra Delivery con Punto de Venta (Venezuela)', async ({ page }, testInfo) => {
    await ejecutarFlujoDeliveryVenezuela(page, testInfo, testData.paymentMethods.puntoDeVenta);
});

test('Flujo E2E - Compra Delivery con Efectivo (Monto Exacto) (Venezuela)', async ({ page }, testInfo) => {
    await ejecutarFlujoDeliveryVenezuela(page, testInfo, testData.paymentMethods.efectivoExacto);
});

test('Flujo E2E - Compra Delivery con Efectivo (Con Cambio) (Venezuela)', async ({ page }, testInfo) => {
    await ejecutarFlujoDeliveryVenezuela(page, testInfo, testData.paymentMethods.efectivoCambio);
});
