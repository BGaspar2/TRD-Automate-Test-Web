import { chromium, expect } from '@playwright/test';

(async () => {
    console.log("Iniciando navegador y navegando a KFC Ecuador...");
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        recordVideo: {
            dir: 'C:\\Users\\Usuario\\Downloads\\aut-test\\tests\\video_result'
        }
    });
    const page = await context.newPage();
    await page.goto("https://kfc-ec-devops5-artisn.vercel.app");
    await page.waitForTimeout(5000);

    //Selectores
    //seleccionar boton de un canal de compra
    // Mezcla el selector CSS de la clase principal con el texto interno
    console.log("Seleccionando canal de compra: Domicilio...");
    const botonDomicilio = page.locator('button.Button').filter({ hasText: 'Domicilio' });
    await botonDomicilio.click();
    await page.waitForTimeout(5000);
    // Selecciona el enlace por su atributo href
    // Localizadores por la clase base del componente
    const sinUbicacion = page.locator('.MissingLocationMessage');
    const conUbicacion = page.locator('.DeliveryAddressMessage');

    // Validación condicional: Si no tiene dirección, hace clic; si ya tiene, ejecuta otra acción
    if (await sinUbicacion.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("No se ha ingresado dirección, haciendo clic...");
        await sinUbicacion.click();
        await page.waitForTimeout(1000);
        // 1. Identificar el campo por placeholder
        const searchInput = page.getByPlaceholder('Buscar dirección');

        // 2. Asegurarnos de que sea visible
        await expect(searchInput).toBeVisible();

        // 3. Escribir en el buscador
        await searchInput.fill('El inca');

        // 4. (Opcional) Presionar Enter si dispara la búsqueda
        await searchInput.press('Enter');
        // 2. Hacer clic en la sugerencia específica que aparece en la lista desplegable
        // Coincidencia exacta con el texto de la primera opción
        await page.locator('.Overlay, .SearchBar__dropdown')
            .getByText('El Inca, Quito, Ecuador', { exact: true })
            .click();
        // Selector CSS combinado con filtro de texto en Playwright
        const botonConfirmar = page.locator('button.Button').filter({ hasText: 'Confirmar ubicación' });
        await botonConfirmar.click();
        await page.waitForTimeout(5000);
    } else if (await conUbicacion.isVisible({ timeout: 5000 }).catch(() => false)) {
        const direccionActual = await conUbicacion.innerText(); // Devuelve "Casa ⦁ El inca", "Casa ⦁ Centro", etc.
        console.log("La dirección ingresada es: ", direccionActual);
    }
    // 1. Obtener todas las figuras de la grilla
    const categorias = page.locator('.CategoriesGrid a figure');
    const totalCategorias = await categorias.count();

    // 2. Generar un índice aleatorio
    const indiceAleatorio = Math.floor(Math.random() * totalCategorias);
    console.log(`Seleccionando categoría aleatoria (${indiceAleatorio + 1} de ${totalCategorias})...`);

    // 3. Hacer clic en una categoría al azar
    await categorias.nth(indiceAleatorio).click();

    // 1. Obtener todas las tarjetas de productos
    const tarjetas = page.locator('.ProductCard');
    const totalProductos = await tarjetas.count();

    // 2. Elegir un índice al azar
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

                // Si empieza con '0', no hay nada seleccionado aún
                if (textoContador.includes('0 /') || textoContador.startsWith('0')) {
                    console.log(`Falta seleccionar en: "${titulo}". Eligiendo primera opción...`);

                    // Si es tipo Radio Button (elegir 1)
                    const primerRadio = grupo.locator('.RadioModifier label').first();
                    if (await primerRadio.isVisible()) {
                        await primerRadio.click();
                        await page.waitForTimeout(200);
                        continue;
                    }

                    // Si es tipo Contador (+)
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
    // 3. Hacer clic en el botón Agregar de esa tarjeta
    console.log(`Seleccionando producto aleatorio (${indiceAleatorio2 + 1} de ${totalProductos}) y haciendo clic en Agregar...`);
    await tarjetas.nth(indiceAleatorio2).getByRole('button', { name: /agregar/i }).click();
    await page.waitForTimeout(5000);


    // === 5. PRIMERO: AUMENTAR CANTIDAD ===
    // Delimitamos la búsqueda únicamente dentro del contenedor '.ProductTotals' visible
    const contenedorTotales = page.locator('.ProductTotals');
    await contenedorTotales.waitFor({ state: 'visible' });

    // Los elementos se buscan DENTRO del contenedor de totales
    const btnSumar = contenedorTotales.locator('.Counter button:has(svg.feather-plus)');
    const contadorTexto = contenedorTotales.locator('.Counter__quantity');
    const btnAgregarCarrito = contenedorTotales.getByTestId('add-to-cart');

    const cantidadDeseada = 3;
    let cantidadActual = parseInt(await contadorTexto.innerText());

    console.log(`Paso 1: Aumentando cantidad de ${cantidadActual} a ${cantidadDeseada}...`);

    while (cantidadActual < cantidadDeseada) {
        await btnSumar.click();
        await page.waitForTimeout(300); // Dar tiempo a la animación de React
        cantidadActual = parseInt(await contadorTexto.innerText());
    }
    await validarYSeleccionarModificadores(page);
    // === 6. LUEGO: AGREGAR AL CARRITO FINAL ===
    console.log("Paso 2: Confirmando y agregando al carrito...");
    await expect(btnAgregarCarrito).toBeVisible();
    await btnAgregarCarrito.click();

    console.log(`¡Listo! Se agregaron ${cantidadDeseada} unidades al pedido.`);

    await page.waitForTimeout(5000);
    // === 7. NAVEGAR AL CARRITO DESDE EL MODAL QUE APARECE ===
    const modalCarrito = page.locator('.ProductInCartModal');

    // Esperar a que el modal dinámico aparezca después de agregar
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

    // 1. Esperar a que el carrito calcule el total y muestre el botón
    await expect(btnIrAPagar).toBeVisible();

    // 2. Hacer scroll si la pantalla es pequeña y dar clic
    await btnIrAPagar.scrollIntoViewIfNeeded();
    await btnIrAPagar.click();
    await page.waitForTimeout(5000);

    console.log("Haciendo clic en 'Completar'...");
    const btnCompletar = page.getByRole('button', { name: 'Completar' });

    // Ejecuta el método .click() directamente en el elemento del DOM
    await btnCompletar.evaluate(node => node.click());

    await page.waitForTimeout(5000);

    console.log("Llenando información de la dirección...");
    // Calle principal (id: mainStreet)
    await page.locator('#mainStreet').fill('Av. Eloy Alfaro');

    // Calle secundaria (id: secondaryStreet)
    await page.locator('#secondaryStreet').fill('Calle los Naranjos');

    // Número de vivienda (id: number)
    await page.locator('#number').fill('N37-188');

    // Referencia (id: reference)
    await page.locator('#reference').fill('Piso 3, Dpto. 302');

    // Teléfono / Celular (id: phone)
    await page.locator('form.form #phone').fill('0992013004');
    // Instrucciones / Textarea (id: instructions)
    await page.locator('#instructions').fill('Dejar con el guardia en garita.');

    console.log("Guardando dirección de entrega...");
    const btnGuardar = page.getByRole('button', { name: /guardar dirección/i });

    await btnGuardar.click();
    await page.waitForTimeout(5000);

    console.log("Llenando datos personales del cliente...");
    await page.locator('#name').fill('Juan');
    await page.locator('#lastName').fill('Pérez');
    await page.locator('#email').fill('juan.perez@example.com');
    // Busca el input de celular dentro del contenedor del cliente/checkout
    await page.locator('.FulfillUser #phone').fill('0981234567');
    await page.locator('#document').fill('1712345678');
    await page.waitForTimeout(5000);

    console.log("Seleccionando método de pago: Efectivo...");
    // Marcar el radio button por su ID único
    await page.locator('#Efectivo').check();
    await page.waitForTimeout(5000);

    // Localiza el botón sin importar el total que tenga al lado
    // const btnPagarAhora = page.getByRole('button', { name: /pagar ahora/i });

    //await btnPagarAhora.click();

    console.log("Flujo de prueba finalizado.");
    await page.waitForTimeout(5000);

    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
        const videoPath = await video.path();
        console.log(`Video grabado en: ${videoPath}`);
    }
})()