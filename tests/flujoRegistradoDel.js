import { test, expect, chromium } from '@playwright/test';
import path from 'path';

// Requisitos para que el flujo funcione:
// 1. Tener una cuenta Google logueada
// 2. Ejecutar node .\tests\auth.js para la sesión guardada en user_data_chrome
// 3. El usuario debe tener al menos 1 dirección y 1 dato de facturación asociada

test('Flujo E2E - Compra a domicilio usuario registrado', async () => {
    const userDataDir = path.resolve(process.cwd(), 'tests', 'user_data_chrome');
    console.log("Cargando sesión guardada desde Chrome...");

    const videoDir = path.resolve(process.cwd(), 'tests', 'video_result');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        recordVideo: {
            dir: videoDir
        }
    });

    const page = context.pages()[0] || await context.newPage();
    await page.goto("https://kfc-ec-devops5-artisn.vercel.app");
    await page.waitForTimeout(5000);

    const btnIngresar = page.getByRole('button', { name: /ingresar|iniciar sesión/i });

    if (await btnIngresar.isVisible({ timeout: 4000 }).catch(() => false)) {
        console.log("Haciendo clic en el botón 'Ingresar'...");
        await btnIngresar.click();
        await page.waitForTimeout(3000);

        console.log("Seleccionando inicio de sesión con Google...");
        const [popupGoogle] = await Promise.all([
            page.waitForEvent('popup'),
            page.getByRole('button', { name: /google/i }).click()
        ]);

        await popupGoogle.waitForLoadState();
        await popupGoogle.waitForEvent('close', { timeout: 10000 }).catch(() => {
            console.log("El popup permanece abierto, revisando interacción...");
        });

        console.log("¡Autenticación completada!");
        await page.waitForTimeout(5000);
    } else {
        console.log("El usuario ya se encuentra autenticado.");
        await page.waitForTimeout(3000);
    }

    console.log("¡Sesión iniciada con éxito! Continuando con el flujo...");
    await page.waitForTimeout(5000);

    console.log("Seleccionando canal de compra: Domicilio...");
    const botonDomicilio = page.locator('button.Button').filter({ hasText: 'Domicilio' });
    await botonDomicilio.click();
    await page.waitForTimeout(5000);

    const sinUbicacion = page.locator('.MissingLocationMessage');
    const conUbicacion = page.locator('.DeliveryAddressMessage');

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

    const cantidadDeseada = 2;
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

    // === 1. VERIFICACIÓN Y LLENADO DE DIRECCIÓN DE ENTREGA ===
    const btnCompletarDireccion = page.getByRole('button', { name: 'Completar' }).first();
    const btnCambiarDireccion = page.getByRole('button', { name: /cambiar/i }).first();

    if (await btnCompletarDireccion.isVisible({ timeout: 4000 }).catch(() => false)) {
        console.log("No hay dirección configurada. Haciendo clic en 'Completar'...");
        await btnCompletarDireccion.evaluate(node => node.click());
        await page.waitForTimeout(3000);

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
    } else if (await btnCambiarDireccion.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log("La dirección de entrega ya está seleccionada y guardada (se muestra botón 'Cambiar').");
    } else {
        console.log("La dirección de entrega ya está configurada.");
    }

    // === 2. VERIFICACIÓN Y LLENADO DE DATOS DE FACTURACIÓN ===
    console.log("Verificando datos de facturación...");
    let inputNombre = page.locator('#name');

    if (await inputNombre.isVisible({ timeout: 3000 }).catch(() => false)) {
        const valorNombre = (await inputNombre.inputValue().catch(() => '')).trim();

        if (!valorNombre) {
            console.log("Los datos de facturación están vacíos. Llenando información del cliente...");
            await inputNombre.fill('Juan');
            await page.locator('#lastName').fill('Pérez');
            await page.locator('#email').fill('juan.perez@example.com');
            await page.locator('.FulfillUser #phone').fill('0981234567');
            await page.locator('#document').fill('1712345678');
            await page.waitForTimeout(3000);
        } else {
            console.log(`Los datos de facturación ya están completos (Cliente: "${valorNombre}").`);
        }
    } else {
        console.log("Los datos de facturación se encuentran completos y guardados.");
    }

    console.log("Seleccionando método de pago: Efectivo...");
    await page.locator('#Efectivo').check();
    await page.waitForTimeout(5000);

    console.log("Flujo de prueba finalizado.");
    await page.waitForTimeout(5000);

    const video = page.video();
    await context.close();

    if (video) {
        const videoPath = await video.path();
        console.log(`Video grabado y guardado en: ${videoPath}`);
    }
});