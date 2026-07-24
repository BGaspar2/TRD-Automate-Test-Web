import { test, expect } from '@playwright/test';

test('Flujo E2E - Compra a domicilio usuario anónimo', async ({ page }) => {
    console.log("Iniciando navegador y navegando a KFC Ecuador...");
    await page.goto("https://kfc-ec-devops5-artisn.vercel.app");
    await page.waitForTimeout(5000);

    // Selectores
    console.log("Seleccionando canal de compra: Domicilio...");
    const botonDomicilio = page.locator('button.Button').filter({ hasText: 'Domicilio' });
    await botonDomicilio.click();
    await page.waitForTimeout(5000);

    const sinUbicacion = page.locator('.MissingLocationMessage');
    const conUbicacion = page.locator('.DeliveryAddressMessage');

    // Validación condicional: Si no tiene dirección, hace clic; si ya tiene, ejecuta otra acción
    if (await sinUbicacion.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("No se ha ingresado dirección, haciendo clic...");
        await sinUbicacion.click();
        await page.waitForTimeout(1000);

        const searchInput = page.getByPlaceholder('Buscar dirección');
        await expect(searchInput).toBeVisible();

        await searchInput.fill('El inca');
        await searchInput.press('Enter');

        await page.locator('.Overlay, .SearchBar__dropdown')
            .getByText('El Inca, Quito, Ecuador', { exact: true })
            .click();

        const botonConfirmar = page.locator('button.Button').filter({ hasText: 'Confirmar ubicación' });
        await botonConfirmar.click();
        await page.waitForTimeout(5000);
    } else if (await conUbicacion.isVisible({ timeout: 5000 }).catch(() => false)) {
        const direccionActual = await conUbicacion.innerText();
        console.log("La dirección ingresada es: ", direccionActual);
    }

    const categorias = page.locator('.CategoriesGrid a figure');
    const totalCategorias = await categorias.count();
    const indiceAleatorio = Math.floor(Math.random() * totalCategorias);
    console.log(`Seleccionando categoría aleatoria (${indiceAleatorio + 1} de ${totalCategorias})...`);

    await categorias.nth(indiceAleatorio).click();

    const tarjetas = page.locator('.ProductCard');
    const totalProductos = await tarjetas.count();
    const indiceAleatorio2 = Math.floor(Math.random() * totalProductos);

    async function validarYSeleccionarModificadores(page) {
        console.log("Validando modificadores obligatorios...");

        const gruposModificadores = page.locator('.ProductForm .ModifiersGroup');
        const totalGrupos = await gruposModificadores.count();

        for (let i = 0; i < totalGrupos; i++) {
            const grupo = gruposModificadores.nth(i);
            const titulo = await grupo.locator('h3').innerText().catch(() => `Grupo ${i + 1}`);
            const contadorElemento = grupo.locator('.ReadonlyCounter');

            if (await contadorElemento.isVisible()) {
                const textoContador = await contadorElemento.innerText();

                if (textoContador.includes('0 /') || textoContador.startsWith('0')) {
                    console.log(`Falta seleccionar en: "${titulo}". Eligiendo primera opción...`);

                    const primerRadio = grupo.locator('.RadioModifier label').first();
                    if (await primerRadio.isVisible()) {
                        await primerRadio.click();
                        await page.waitForTimeout(200);
                        continue;
                    }

                    const primerBotonMas = grupo.locator('.CounterModifier button:has(svg.feather-plus)').first();
                    if (await primerBotonMas.isVisible()) {
                        await primerBotonMas.click();
                        await page.waitForTimeout(200);
                    }
                } else {
                    console.log(`Modificador listo en: "${titulo}" (${textoContador.replace(/\n/g, '')}).`);
                }
            }
        }
    }

    console.log(`Seleccionando producto aleatorio (${indiceAleatorio2 + 1} de ${totalProductos}) y haciendo clic en Agregar...`);
    await tarjetas.nth(indiceAleatorio2).getByRole('button', { name: /agregar/i }).click();
    await page.waitForTimeout(5000);

    const contenedorTotales = page.locator('.ProductTotals');
    await contenedorTotales.waitFor({ state: 'visible' });

    const btnSumar = contenedorTotales.locator('.Counter button:has(svg.feather-plus)');
    const contadorTexto = contenedorTotales.locator('.Counter__quantity');
    const btnAgregarCarrito = contenedorTotales.getByTestId('add-to-cart');

    const cantidadDeseada = 3;
    let cantidadActual = parseInt(await contadorTexto.innerText());

    console.log(`Paso 1: Aumentando cantidad de ${cantidadActual} a ${cantidadDeseada}...`);

    while (cantidadActual < cantidadDeseada) {
        await btnSumar.click();
        await page.waitForTimeout(300);
        cantidadActual = parseInt(await contadorTexto.innerText());
    }

    await validarYSeleccionarModificadores(page);

    console.log("Paso 2: Confirmando y agregando al carrito...");
    await expect(btnAgregarCarrito).toBeVisible();
    await btnAgregarCarrito.click();

    console.log(`¡Listo! Se agregaron ${cantidadDeseada} unidades al pedido.`);
    await page.waitForTimeout(5000);

    const modalCarrito = page.locator('.ProductInCartModal');

    if (await modalCarrito.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("Modal de producto añadido detectado.");
        const btnVerCarrito = modalCarrito.getByRole('button', { name: /ver carrito/i });
        await btnVerCarrito.click();
        console.log("Navegando al carrito...");
    } else {
        console.log("El modal se ocultó o la pantalla es pequeña.");
    }
    await page.waitForTimeout(5000);

    console.log("Navegando al checkout ('Ir a pagar')...");
    const btnIrAPagar = page.getByRole('button', { name: /ir a pagar/i });

    await expect(btnIrAPagar).toBeVisible();
    await btnIrAPagar.scrollIntoViewIfNeeded();
    await btnIrAPagar.click();
    await page.waitForTimeout(5000);

    console.log("Haciendo clic en 'Completar'...");
    const btnCompletar = page.getByRole('button', { name: 'Completar' });
    await btnCompletar.evaluate(node => node.click());
    await page.waitForTimeout(5000);

    console.log("Llenando información de la dirección...");
    await page.locator('#mainStreet').fill('Av. Eloy Alfaro');
    await page.locator('#secondaryStreet').fill('Calle los Naranjos');
    await page.locator('#number').fill('N37-188');
    await page.locator('#reference').fill('Piso 3, Dpto. 302');
    await page.locator('form.form #phone').fill('0992013004');
    await page.locator('#instructions').fill('Dejar con el guardia en garita.');

    console.log("Guardando dirección de entrega...");
    const btnGuardar = page.getByRole('button', { name: /guardar dirección/i });
    await btnGuardar.click();
    await page.waitForTimeout(5000);

    console.log("Llenando datos personales del cliente...");
    await page.locator('#name').fill('Juan');
    await page.locator('#lastName').fill('Pérez');
    await page.locator('#email').fill('juan.perez@example.com');
    await page.locator('.FulfillUser #phone').fill('0981234567');
    await page.locator('#document').fill('1712345678');
    await page.waitForTimeout(5000);

    console.log("Seleccionando método de pago: Efectivo...");
    await page.locator('#Efectivo').check();
    await page.waitForTimeout(5000);

    console.log("Flujo de prueba finalizado.");
    await page.waitForTimeout(5000);
});