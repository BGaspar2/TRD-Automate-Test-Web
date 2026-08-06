import { test } from '@playwright/test';

// Configurar ejecución secuencial (serial)
test.describe.configure({ mode: 'serial' });

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

    test('🇦🇷 Argentina - Compra en Pickup usuario anónimo', async ({ page }) => {
        const homePage = new HomePageAR(page);
        const menuPage = new MenuPageAR(page);
        const cartPage = new CartPageAR(page);
        const checkoutPage = new CheckoutPageAR(page);

        await homePage.navegar(testDataAR.baseUrl);
        await homePage.seleccionarCanalPickup(testDataAR.location.searchQuery, testDataAR.location.fullAddress);

        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testDataAR.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testDataAR.order.desiredQuantity);

        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();

        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDatosPersonales(testDataAR.customer);
        await checkoutPage.seleccionarMetodoPago(testDataAR.paymentMethodId);

        console.log("Flujo Argentina finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇧🇷 Brasil - Compra en Pickup usuario anónimo', async ({ page }) => {
        const homePage = new HomePageBR(page);
        const menuPage = new MenuPageBR(page);
        const cartPage = new CartPageBR(page);
        const checkoutPage = new CheckoutPageBR(page);

        await homePage.navegar(testDataBR.baseUrl);
        await homePage.seleccionarCanalPickup(testDataBR.location.searchQuery, testDataBR.location.fullAddress);

        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testDataBR.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testDataBR.order.desiredQuantity);

        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();

        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDatosPersonales(testDataBR.customer);
        await checkoutPage.seleccionarMetodoPago(testDataBR.paymentMethodId);

        console.log("Flujo Brasil finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇪🇨 Ecuador - Compra a domicilio usuario anónimo', async ({ page }) => {
        const homePage = new HomePageEC(page);
        const menuPage = new MenuPageEC(page);
        const cartPage = new CartPageEC(page);
        const checkoutPage = new CheckoutPageEC(page);

        await homePage.navegar(testDataEC.baseUrl);
        await homePage.seleccionarCanalDomicilio();
        await homePage.configurarUbicacion(testDataEC.location.searchQuery, testDataEC.location.fullAddress);

        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testDataEC.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testDataEC.order.desiredQuantity);

        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();

        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDireccionEntrega(testDataEC.deliveryAddress);
        await checkoutPage.llenarDatosPersonales(testDataEC.customer);
        await checkoutPage.seleccionarMetodoPago(testDataEC.paymentMethodId);

        console.log("Flujo Ecuador finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇨🇱 Chile - Compra a domicilio usuario anónimo', async ({ page }) => {
        const homePage = new HomePageCL(page);
        const menuPage = new MenuPageCL(page);
        const cartPage = new CartPageCL(page);
        const checkoutPage = new CheckoutPageCL(page);

        await homePage.navegar(testDataCL.baseUrl);
        await homePage.seleccionarCanalDomicilio();
        await homePage.configurarUbicacion(testDataCL.location.searchQuery, testDataCL.location.fullAddress);

        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testDataCL.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testDataCL.order.desiredQuantity);

        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();

        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDireccionEntrega(testDataCL.deliveryAddress);
        await checkoutPage.llenarDatosPersonales(testDataCL.customer);
        await checkoutPage.seleccionarMetodoPago(testDataCL.paymentMethodId);

        console.log("Flujo Chile finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇨🇴 Colombia - Compra a domicilio usuario anónimo', async ({ page }) => {
        const homePage = new HomePageCO(page);
        const menuPage = new MenuPageCO(page);
        const cartPage = new CartPageCO(page);
        const checkoutPage = new CheckoutPageCO(page);

        await homePage.navegar(testDataCO.baseUrl);
        await homePage.seleccionarCanalDomicilio();
        await homePage.configurarUbicacion(testDataCO.location.searchQuery, testDataCO.location.fullAddress);

        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testDataCO.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testDataCO.order.desiredQuantity);

        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();

        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDireccionEntrega(testDataCO.deliveryAddress);
        await checkoutPage.llenarDatosPersonales(testDataCO.customer);
        await checkoutPage.seleccionarMetodoPago(testDataCO.paymentMethodId);

        console.log("Flujo Colombia finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

    test('🇻🇪 Venezuela - Compra a domicilio usuario anónimo', async ({ page }) => {
        const homePage = new HomePageVE(page);
        const menuPage = new MenuPageVE(page);
        const cartPage = new CartPageVE(page);
        const checkoutPage = new CheckoutPageVE(page);

        await homePage.navegar(testDataVE.baseUrl);
        await homePage.seleccionarCanalDomicilio();
        await homePage.configurarUbicacion(testDataVE.location.searchQuery, testDataVE.location.fullAddress);

        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testDataVE.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testDataVE.order.desiredQuantity);

        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();

        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDireccionEntrega(testDataVE.deliveryAddress);
        await checkoutPage.llenarDatosPersonales(testDataVE.customer);
        await checkoutPage.seleccionarMetodoPago(testDataVE.paymentMethodId);

        console.log("Flujo Venezuela finalizado con éxito.");
        await page.waitForTimeout(3000);
    });

});
