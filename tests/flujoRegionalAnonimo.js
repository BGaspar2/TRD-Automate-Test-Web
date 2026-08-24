import { test } from '@playwright/test';
import { ejecutarPaso } from '../utils/pasos.js';

// Las pruebas se ejecutan secuencialmente de forma independiente (con --workers=1)
// permitiendo que si un país falla, la ejecución continúe con los siguientes países.

// 🇦🇷 ARGENTINA
import { testData as testDataAR } from './argentina/data/testData.js';
import { HomePage as HomePageAR } from './argentina/pages/HomePage.js';
import { MenuPage as MenuPageAR } from './argentina/pages/MenuPage.js';
import { CartPage as CartPageAR } from './argentina/pages/CartPage.js';
import { CheckoutPage as CheckoutPageAR } from './argentina/pages/CheckoutPage.js';

// 🇧🇷 BRASIL
import { testData as testDataBR } from './brasil/data/testData.js';
import { HomePage as HomePageBR } from './brasil/pages/HomePage.js';
import { MenuPage as MenuPageBR } from './brasil/pages/MenuPage.js';
import { CartPage as CartPageBR } from './brasil/pages/CartPage.js';
import { CheckoutPage as CheckoutPageBR } from './brasil/pages/CheckoutPage.js';

// 🇪🇨 ECUADOR
import { testData as testDataEC } from './ecuador/data/testData.js';
import { HomePage as HomePageEC } from './ecuador/pages/HomePage.js';
import { MenuPage as MenuPageEC } from './ecuador/pages/MenuPage.js';
import { CartPage as CartPageEC } from './ecuador/pages/CartPage.js';
import { CheckoutPage as CheckoutPageEC } from './ecuador/pages/CheckoutPage.js';

// 🇨🇱 CHILE
import { testData as testDataCL } from './chile/data/testData.js';
import { HomePage as HomePageCL } from './chile/pages/HomePage.js';
import { MenuPage as MenuPageCL } from './chile/pages/MenuPage.js';
import { CartPage as CartPageCL } from './chile/pages/CartPage.js';
import { CheckoutPage as CheckoutPageCL } from './chile/pages/CheckoutPage.js';

// 🇨🇴 COLOMBIA
import { testData as testDataCO } from './colombia/data/testData.js';
import { HomePage as HomePageCO } from './colombia/pages/HomePage.js';
import { MenuPage as MenuPageCO } from './colombia/pages/MenuPage.js';
import { CartPage as CartPageCO } from './colombia/pages/CartPage.js';
import { CheckoutPage as CheckoutPageCO } from './colombia/pages/CheckoutPage.js';

// 🇻🇪 VENEZUELA
import { testData as testDataVE } from './venezuela/data/testData.js';
import { HomePage as HomePageVE } from './venezuela/pages/HomePage.js';
import { MenuPage as MenuPageVE } from './venezuela/pages/MenuPage.js';
import { CartPage as CartPageVE } from './venezuela/pages/CartPage.js';
import { CheckoutPage as CheckoutPageVE } from './venezuela/pages/CheckoutPage.js';

test.describe('Suite Regional LATAM - Flujo Compra Anónima (AR, BR, CL, CO, EC, VE)', () => {

    test('🇦🇷 Argentina - Compra en Pickup usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageAR(page);
        const menuPage = new MenuPageAR(page);
        const cartPage = new CartPageAR(page);
        const checkoutPage = new CheckoutPageAR(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Selección de Tienda Pickup',
            descripcion: 'Ingreso al sitio web de KFC Argentina y selección de sucursal para retiro'
        }, async () => {
            await homePage.navegar(testDataAR.baseUrl);
            await homePage.seleccionarCanalPickup(testDataAR.location.searchQuery, testDataAR.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataAR.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataAR.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Datos de Facturación y Selección de Pago',
            descripcion: 'Ingreso de datos del cliente y método de pago en Argentina'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDatosPersonales(testDataAR.customer);
            await checkoutPage.seleccionarMetodoPago(testDataAR.paymentMethodId);
        });

        console.log("Flujo Argentina finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇧🇷 Brasil - Compra en Pickup usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageBR(page);
        const menuPage = new MenuPageBR(page);
        const cartPage = new CartPageBR(page);
        const checkoutPage = new CheckoutPageBR(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegação e Seleção de Loja Pickup',
            descripcion: 'Acesso ao KFC Brasil e seleção da loja física para retirada'
        }, async () => {
            await homePage.navegar(testDataBR.baseUrl);
            await homePage.seleccionarCanalPickup(testDataBR.location.searchQuery, testDataBR.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Seleção do Menu e Personalização do Produto',
            descripcion: 'Escolha de categoria, produto, modificadores e adição ao carrinho'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataBR.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataBR.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisão e Validação do Carrinho',
            descripcion: 'Verificação de regras de montante e prosseguimento ao pagamento'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Dados Pessoais e Forma de Pagamento',
            descripcion: 'Preenchimento dos dados do cliente e seleção de pagamento no Brasil'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDatosPersonales(testDataBR.customer);
            await checkoutPage.seleccionarMetodoPago(testDataBR.paymentMethodId);
        });

        console.log("Flujo Brasil finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇪🇨 Ecuador - Compra en Pickup usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageEC(page);
        const menuPage = new MenuPageEC(page);
        const cartPage = new CartPageEC(page);
        const checkoutPage = new CheckoutPageEC(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Selección de Tienda Pickup',
            descripcion: 'Ingreso al sitio web de KFC Ecuador y selección de local para retiro'
        }, async () => {
            await homePage.navegar(testDataEC.baseUrl);
            await homePage.seleccionarCanalPickup(testDataEC.location.searchQuery, testDataEC.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataEC.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataEC.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Datos de Facturación y Selección de Pago',
            descripcion: 'Ingreso de datos de contacto y selección de método de pago'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDatosPersonales(testDataEC.customer);
            await checkoutPage.seleccionarMetodoPago(testDataEC.paymentMethodId);
        });

        console.log("Flujo Ecuador Pickup finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇪🇨 Ecuador - Compra a domicilio usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageEC(page);
        const menuPage = new MenuPageEC(page);
        const cartPage = new CartPageEC(page);
        const checkoutPage = new CheckoutPageEC(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Configuración de Dirección Delivery',
            descripcion: 'Ingreso a KFC Ecuador y selección de dirección de entrega'
        }, async () => {
            await homePage.navegar(testDataEC.baseUrl);
            await homePage.seleccionarCanalDomicilio();
            await homePage.configurarUbicacion(testDataEC.location.searchQuery, testDataEC.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataEC.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataEC.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Dirección de Entrega, Datos Personales y Pago',
            descripcion: 'Ingreso de datos de entrega y selección de método de pago'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDireccionEntrega(testDataEC.deliveryAddress);
            await checkoutPage.llenarDatosPersonales(testDataEC.customer);
            await checkoutPage.seleccionarMetodoPago(testDataEC.paymentMethodId);
        });

        console.log("Flujo Ecuador Delivery finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇨🇱 Chile - Compra en Pickup usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageCL(page);
        const menuPage = new MenuPageCL(page);
        const cartPage = new CartPageCL(page);
        const checkoutPage = new CheckoutPageCL(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Selección de Tienda Pickup',
            descripcion: 'Ingreso a KFC Chile y selección de local para retiro en tienda'
        }, async () => {
            await homePage.navegar(testDataCL.baseUrl);
            await homePage.seleccionarCanalPickup(testDataCL.location.searchQuery, testDataCL.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataCL.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataCL.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Datos de Facturación y Selección de Pago',
            descripcion: 'Ingreso de datos de contacto y selección de método de pago en Chile'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDatosPersonales(testDataCL.customer);
            await checkoutPage.seleccionarMetodoPago(testDataCL.paymentMethodId);
        });

        console.log("Flujo Chile Pickup finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇨🇱 Chile - Compra a domicilio usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageCL(page);
        const menuPage = new MenuPageCL(page);
        const cartPage = new CartPageCL(page);
        const checkoutPage = new CheckoutPageCL(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Configuración de Dirección Delivery',
            descripcion: 'Ingreso a KFC Chile y selección de dirección de entrega'
        }, async () => {
            await homePage.navegar(testDataCL.baseUrl);
            await homePage.seleccionarCanalDomicilio();
            await homePage.configurarUbicacion(testDataCL.location.searchQuery, testDataCL.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataCL.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataCL.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Dirección de Entrega, Datos Personales y Pago',
            descripcion: 'Ingreso de dirección de entrega, datos del cliente y método de pago'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDireccionEntrega(testDataCL.deliveryAddress);
            await checkoutPage.llenarDatosPersonales(testDataCL.customer);
            await checkoutPage.seleccionarMetodoPago(testDataCL.paymentMethodId);
        });

        console.log("Flujo Chile Delivery finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇨🇴 Colombia - Compra en Pickup usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageCO(page);
        const menuPage = new MenuPageCO(page);
        const cartPage = new CartPageCO(page);
        const checkoutPage = new CheckoutPageCO(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Selección de Tienda Pickup',
            descripcion: 'Ingreso a KFC Colombia y selección de tienda para retiro'
        }, async () => {
            await homePage.navegar(testDataCO.baseUrl);
            await homePage.seleccionarCanalPickup(testDataCO.location.searchQuery, testDataCO.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataCO.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataCO.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Datos de Facturación y Selección de Pago',
            descripcion: 'Ingreso de datos de contacto y selección de método de pago en Colombia'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDatosPersonales(testDataCO.customer);
            await checkoutPage.seleccionarMetodoPago(testDataCO.paymentMethodId);
        });

        console.log("Flujo Colombia Pickup finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇨🇴 Colombia - Compra a domicilio usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageCO(page);
        const menuPage = new MenuPageCO(page);
        const cartPage = new CartPageCO(page);
        const checkoutPage = new CheckoutPageCO(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Configuración de Dirección Delivery',
            descripcion: 'Ingreso a KFC Colombia y selección de dirección de entrega a domicilio'
        }, async () => {
            await homePage.navegar(testDataCO.baseUrl);
            await homePage.seleccionarCanalDomicilio();
            await homePage.configurarUbicacion(testDataCO.location.searchQuery, testDataCO.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataCO.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataCO.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Dirección de Entrega, Datos Personales y Pago',
            descripcion: 'Ingreso de dirección de entrega, datos del cliente y método de pago'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDireccionEntrega(testDataCO.deliveryAddress);
            await checkoutPage.llenarDatosPersonales(testDataCO.customer);
            await checkoutPage.seleccionarMetodoPago(testDataCO.paymentMethodId);
        });

        console.log("Flujo Colombia Delivery finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇻🇪 Venezuela - Compra a domicilio usuario anónimo', async ({ page }, testInfo) => {
        const homePage = new HomePageVE(page);
        const menuPage = new MenuPageVE(page);
        const cartPage = new CartPageVE(page);
        const checkoutPage = new CheckoutPageVE(page);

        await ejecutarPaso(page, testInfo, {
            numero: 1,
            titulo: 'Navegación y Configuración de Dirección Delivery',
            descripcion: 'Ingreso a KFC Venezuela y selección de dirección de entrega a domicilio'
        }, async () => {
            await homePage.navegar(testDataVE.baseUrl);
            await homePage.seleccionarCanalDomicilio();
            await homePage.configurarUbicacion(testDataVE.location.searchQuery, testDataVE.location.fullAddress);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 2,
            titulo: 'Selección de Menú y Personalización de Producto',
            descripcion: 'Elección de categoría, producto aleatorio, modificadores y agregado al pedido'
        }, async () => {
            await menuPage.seleccionarCategoriaAleatoria();
            await menuPage.seleccionarProductoAleatorio();
            await menuPage.ajustarCantidad(testDataVE.order.desiredQuantity);
            await menuPage.validarYSeleccionarModificadores();
            await menuPage.agregarAlCarrito(testDataVE.order.desiredQuantity);
        });

        await ejecutarPaso(page, testInfo, {
            numero: 3,
            titulo: 'Revisión y Validación del Carrito de Compras',
            descripcion: 'Verificación de montos mínimos/máximos y avance a pagar'
        }, async () => {
            await cartPage.procesarModalCarrito();
            await cartPage.validarYAjustarMontoCarrito();
            await cartPage.irAPagar();
        });

        await ejecutarPaso(page, testInfo, {
            numero: 4,
            titulo: 'Dirección de Entrega, Datos Personales y Pago',
            descripcion: 'Ingreso de dirección de entrega, datos del cliente y método de pago'
        }, async () => {
            await checkoutPage.iniciarCompletar();
            await checkoutPage.llenarDireccionEntrega(testDataVE.deliveryAddress);
            await checkoutPage.llenarDatosPersonales(testDataVE.customer);
            await checkoutPage.seleccionarMetodoPago(testDataVE.paymentMethodId);
        });

        console.log("Flujo Venezuela finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

});
