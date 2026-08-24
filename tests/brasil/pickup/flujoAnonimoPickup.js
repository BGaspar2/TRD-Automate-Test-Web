import { test } from '@playwright/test';
import { testData } from '../data/testData.js';
import { HomePage } from '../pages/HomePage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { ejecutarPaso } from '../../../utils/pasos.js';

test('Flujo E2E - Compra en Pickup usuario anónimo (Brasil)', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);
    const menuPage = new MenuPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Passo 1: Navegação e Seleção de Loja Pickup
    await ejecutarPaso(page, testInfo, {
        numero: 1,
        titulo: 'Navegação e Seleção de Loja Pickup',
        descripcion: 'Acesso ao KFC Brasil e seleção da loja física para retirada'
    }, async () => {
        await homePage.navegar(testData.baseUrl);
        await homePage.seleccionarCanalPickup(testData.location.searchQuery, testData.location.fullAddress);
    });

    // Passo 2: Seleção do Menu e Personalização do Produto
    await ejecutarPaso(page, testInfo, {
        numero: 2,
        titulo: 'Seleção do Menu e Personalização do Produto',
        descripcion: 'Escolha de categoria, produto, modificadores e adição ao carrinho'
    }, async () => {
        await menuPage.seleccionarCategoriaAleatoria();
        await menuPage.seleccionarProductoAleatorio();
        await menuPage.ajustarCantidad(testData.order.desiredQuantity);
        await menuPage.validarYSeleccionarModificadores();
        await menuPage.agregarAlCarrito(testData.order.desiredQuantity);
    });

    // Passo 3: Revisão e Validação do Carrinho
    await ejecutarPaso(page, testInfo, {
        numero: 3,
        titulo: 'Revisão e Validação do Carrinho',
        descripcion: 'Verificação de regras de montante e prosseguimento ao pagamento'
    }, async () => {
        await cartPage.procesarModalCarrito();
        await cartPage.validarYAjustarMontoCarrito();
        await cartPage.irAPagar();
    });

    // Passo 4: Dados Pessoais e Forma de Pagamento
    await ejecutarPaso(page, testInfo, {
        numero: 4,
        titulo: 'Dados Pessoais e Forma de Pagamento',
        descripcion: 'Preenchimento dos dados do cliente e seleção de pagamento no Brasil'
    }, async () => {
        await checkoutPage.iniciarCompletar();
        await checkoutPage.llenarDatosPersonales(testData.customer);
        await checkoutPage.seleccionarMetodoPago(testData.paymentMethodId);
    });

    console.log("Flujo E2E Pickup finalizado con éxito en Brasil.");
    await page.waitForTimeout(5000);
});
