import { expect, test } from '@playwright/test';

export class HomePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        this.botonDomicilio = page.getByRole('button', { name: /domicilio|domicílio|delivery|entrega|envío|envio|receber|receba|para entrega/i })
            .or(page.getByRole('tab', { name: /domicilio|domicílio|delivery|entrega|envío|envio|receber|receba|para entrega/i }))
            .or(page.locator('button.Button, button, [role="button"], [class*="Channel"], [data-testid*="delivery"], [data-testid*="domicilio"]').filter({ hasText: /domicilio|domicílio|delivery|entrega|envío|envio|receber|receba|para entrega/i }));

        this.botonPickup = page.getByRole('button', { name: /pickup|retiro|retirada|retire|para llevar|recoge|recoger|retirar|retirá|retira|pedí|pedi|tienda|pegar|balcão|balcao|takeout|loja|restaurante/i })
            .or(page.getByRole('tab', { name: /pickup|retiro|retirada|retire|para llevar|recoge|recoger|retirar|retirá|retira|pedí|pedi|tienda|pegar|balcão|balcao|takeout|loja|restaurante/i }))
            .or(page.locator('button.Button, button, [role="button"], [class*="Channel"], [data-testid*="pickup"], [data-testid*="retiro"], [data-testid*="retirada"]').filter({ hasText: /pickup|retiro|retirada|retire|para llevar|recoge|recoger|retirar|retirá|retira|pedí|pedi|tienda|pegar|balcão|balcao|takeout|loja|restaurante/i }));

        this.sinUbicacion = page.locator('.MissingLocationMessage, [class*="MissingLocation"], [class*="no-location"]');
        this.conUbicacion = page.locator('.DeliveryAddressMessage, [class*="DeliveryAddress"], [class*="address-message"]');

        this.dialogUbicacion = page.locator('.Overlay, .Modal, [role="dialog"], [class*="Modal"], [class*="Overlay"]');

        this.botonConfirmar = page.getByRole('button', { name: /confirmar|aceptar|confirmar endereço|avançar|continuar/i })
            .or(page.locator('button.Button, button, [role="button"]').filter({ hasText: /confirmar|aceptar|confirmar endereço|avançar|continuar/i }));

        this.botonMostrarMasTiendas = page.getByRole('button', { name: /mostrar más tiendas|ver más tiendas|mostrar más locales|ver más locales|mostrar mais lojas|ver mais lojas|mostrar mais restaurantes|ver mais restaurantes|mostrar más|ver más|mostrar mais|ver mais/i })
            .or(page.locator('button.Button, button, [role="button"], a').filter({ hasText: /mostrar más tiendas|ver más tiendas|mostrar más locales|ver más locales|mostrar mais lojas|ver mais lojas|mostrar mais restaurantes|ver mais restaurantes|mostrar más|ver más|mostrar mais|ver mais/i }));

        this.botonSeleccionarTienda = page.getByRole('button', { name: /seleccionar tienda|seleccionar local|elegir tienda|selecionar loja|selecionar restaurante|selecionar/i })
            .or(page.locator('button.Button, button, [role="button"]').filter({ hasText: /seleccionar tienda|seleccionar local|elegir tienda|selecionar loja|selecionar restaurante|selecionar/i }));
    }

    async navegar(url) {
        console.log(`Iniciando navegador y navegando a ${url}...`);
        await this.page.goto(url);
        await this.page.waitForTimeout(5000);
    }

    async verificarLocalesCerrados() {
        const alertaCerrados = this.page.locator('.Alert, [class*="alert"], [class*="Banner"], [class*="danger"], [class*="error"], div, p, span')
            .filter({ hasText: /locales se encuentran cerrados|tiendas cerradas|lojas fechadas|intenta más tarde|cerrados|arma tu pedido|sé el primero en ordenar|seja o primeiro a pedir|nuestro horario|nosso horário|nosso horario|cuando abramos|quando abrirmos/i }).first();

        if (await alertaCerrados.isVisible({ timeout: 1500 }).catch(() => false)) {
            const mensaje = await alertaCerrados.innerText().catch(() => 'Los locales se encuentran cerrados.');
            console.log(`⚠️ ALERTA DE LOCALES CERRADOS DETECTADA: "${mensaje.trim()}". Omitiendo la prueba (test.skip)...`);
            test.skip(true, `Test omitido: ${mensaje.trim()}`);
        }
    }

    async seleccionarCanalDomicilio() {
        console.log("Seleccionando canal de compra: Domicilio...");
        const btn = this.botonDomicilio.first();
        if (await btn.isVisible({ timeout: 6000 }).catch(() => false)) {
            await btn.click();
            await this.page.waitForTimeout(3000);
        }
    }

    async seleccionarCanalPickup(searchQuery = null, fullAddress = null) {
        console.log("Seleccionando canal de compra: Pickup (Retiro en tienda)...");
        const btn = this.botonPickup.first();
        const esVisible = await btn.isVisible({ timeout: 5000 }).catch(() => false);
        if (esVisible) {
            await btn.click();
            console.log("Canal Pickup seleccionado con éxito.");
            await this.page.waitForTimeout(2000);

            await this.seleccionarTiendaPickup(searchQuery, fullAddress).catch(() => {});
        } else {
            console.log("El canal Pickup no se encuentra disponible en la página principal para este país.");
        }
        await this.page.waitForTimeout(3000);
    }

    async seleccionarTiendaPickup(searchQuery = null, fullAddress = null) {
        console.log("Procesando selección de tienda en el modal de Pickup...");

        if (searchQuery) {
            const modalPickup = this.dialogUbicacion.first();
            const inputBusquedaModal = modalPickup.locator('input[type="text"], input[type="search"], input').first();

            if (await inputBusquedaModal.isVisible({ timeout: 5000 }).catch(() => false)) {
                console.log(`Escribiendo en el buscador de Pickup: "${searchQuery}"...`);
                await inputBusquedaModal.click();
                await inputBusquedaModal.fill(searchQuery);
                await this.page.waitForTimeout(1000);

                const textoABuscar = fullAddress || searchQuery;
                const opcionDropdown = this.page.locator('.Overlay, .SearchBar__dropdown, [class*="dropdown"], [class*="Overlay"], [class*="suggestion"], [role="option"]')
                    .getByText(textoABuscar, { exact: false })
                    .or(this.page.getByText(searchQuery, { exact: false }));

                if (await opcionDropdown.first().isVisible({ timeout: 4000 }).catch(() => false)) {
                    console.log(`Seleccionando sugerencia de ubicación: "${textoABuscar}"...`);
                    await opcionDropdown.first().click();
                } else {
                    await inputBusquedaModal.press('ArrowDown');
                    await inputBusquedaModal.press('Enter');
                }
                console.log("Esperando a que las tiendas se carguen en la lista tras seleccionar ubicación...");
                await this.page.waitForTimeout(3000);
            }
        }

        const btnSeleccionar = this.botonSeleccionarTienda.first();
        if (await btnSeleccionar.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log("Haciendo clic en 'Seleccionar tienda' / 'Selecionar loja'...");
            await btnSeleccionar.click();
            await this.page.waitForTimeout(4000);
            return;
        }

        const btnMostrarMas = this.botonMostrarMasTiendas.first();
        if (await btnMostrarMas.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log("Haciendo clic en 'Ver/Mostrar más tiendas'...");
            await btnMostrarMas.click();
            await this.page.waitForTimeout(2000);

            if (await btnSeleccionar.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log("Seleccionando tienda tras mostrar más...");
                await btnSeleccionar.click();
                await this.page.waitForTimeout(4000);
                return;
            }
        }

        console.log("Buscando la tarjeta de la tienda en el listado...");
        const locatorCadena = this.page.getByText(/CC KFC ALTO PALERMO|CC KFC MERLO|CC KFC RECOLETA|CC KFC GUEMES|CC KFC|VILA OLIMPA|GUARDIA VIEJA|TOBERIN|EL INCA|SABANA GRANDE/i)
            .or(this.page.locator('div[class*="cursor-pointer"][class*="p-3"]'))
            .or(this.page.locator('div.flex.cursor-pointer.p-3'))
            .or(this.page.locator('p').filter({ hasText: /CC KFC|ALTO PALERMO|VILA|GUARDIA|TOBERIN|EL INCA|SABANA/i }));

        const opcionTienda = locatorCadena.first();
        await opcionTienda.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

        if (await opcionTienda.isVisible().catch(() => false)) {
            console.log("Haciendo clic en la tienda para confirmar selección...");
            await opcionTienda.scrollIntoViewIfNeeded().catch(() => {});
            
            await opcionTienda.click({ force: true }).catch(async () => {
                await opcionTienda.evaluate(el => el.click());
            });
            await this.page.waitForTimeout(3000);

            const btnConfirmar = this.page.getByRole('button', { name: /aceptar|confirmar|cambiar|continuar|ir al menú|sim|sí/i }).first();
            if (await btnConfirmar.isVisible({ timeout: 1500 }).catch(() => false)) {
                console.log("Confirmando modal de cambio de tienda...");
                await btnConfirmar.click().catch(async () => {
                    await btnConfirmar.evaluate(b => b.click());
                });
                await this.page.waitForTimeout(2000);
            }

            if (!this.page.url().includes('/menu')) {
                console.log("Navegando al menú (/menu)...");
                const currentUrl = this.page.url();
                const origin = new URL(currentUrl).origin;
                await this.page.goto(`${origin}/menu`, { waitUntil: 'domcontentloaded' }).catch(() => {});
                await this.page.waitForTimeout(3000);
            }

            await this.page.waitForSelector('.CategoriesGrid, [class*="CategoriesGrid"], a figure', { timeout: 15000 }).catch(() => {});
            await this.page.waitForTimeout(2000);
        }
    }

    async configurarUbicacion(searchQuery, fullAddress) {
        console.log("Configurando ubicación para entrega a domicilio...");

        // 1. Abrir el modal de dirección haciendo clic en el selector de ubicación del header
        const btnAbrirUbicacion = this.page.locator('header, nav, .Header, [class*="Header"]').locator('button, div, a, span')
            .filter({ hasText: /ingresa tu ubicación|ingresa tu ubicacion|ingresar dirección|selecciona tu ubicación|seleccionar ubicación|endereço/i })
            .or(this.sinUbicacion)
            .or(this.conUbicacion)
            .or(this.page.getByText(/ingresa tu ubicación|ingresa tu ubicacion/i));

        const btnUbicacion = btnAbrirUbicacion.first();
        if (await btnUbicacion.isVisible({ timeout: 6000 }).catch(() => false)) {
            console.log("Haciendo clic en 'Ingresa tu ubicación' para abrir el modal...");
            await btnUbicacion.click({ force: true }).catch(async () => {
                await btnUbicacion.evaluate(b => b.click());
            });
            await this.page.waitForTimeout(2000);
        }

        // 2. Esperar a que el modal de ubicación esté presente
        const modalUbicacion = this.page.locator('.Overlay, .Modal, [role="dialog"], [class*="Modal"], [class*="Overlay"]').first();
        await modalUbicacion.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {
            console.log("Aviso: Esperando contenedor modal de ubicación...");
        });

        // 3. Buscar el input EXCLUSIVAMENTE dentro del modal de ubicación (para no escribir en el buscador de productos)
        const modalInput = modalUbicacion.locator('input[type="text"], input[type="search"], input[placeholder*="dirección"], input[placeholder*="ubicación"], input').first();

        if (await modalInput.isVisible({ timeout: 6000 }).catch(() => false)) {
            console.log(`Escribiendo ubicación en el modal: "${searchQuery}"...`);
            await modalInput.click().catch(() => {});
            await modalInput.fill(searchQuery);
            await modalInput.press('Enter');
            await this.page.waitForTimeout(2000);
        } else {
            console.log("⚠️ No se encontró el input dentro del modal de ubicación. Buscando fallback...");
            const inputFallback = this.page.locator('.Overlay input, .Modal input, [role="dialog"] input').first();
            if (await inputFallback.isVisible({ timeout: 3000 }).catch(() => false)) {
                await inputFallback.click();
                await inputFallback.fill(searchQuery);
                await inputFallback.press('Enter');
                await this.page.waitForTimeout(2000);
            }
        }

        // 4. Seleccionar sugerencia en el dropdown de direcciones
        const textoABuscar = fullAddress || searchQuery;
        const opcionDropdown = this.page.locator('.Overlay, .SearchBar__dropdown, [class*="dropdown"], [class*="suggestion"], [class*="Overlay"], [role="option"]')
            .getByText(textoABuscar, { exact: false })
            .or(this.page.getByText(searchQuery, { exact: false }));
        
        if (await opcionDropdown.first().isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log(`Seleccionando opción de dirección: "${textoABuscar}"...`);
            await opcionDropdown.first().click().catch(() => {});
            await this.page.waitForTimeout(2000);
        }

        await this.verificarLocalesCerrados();

        // 5. Clic en tarjeta/barra oscura de dirección seleccionada si aparece
        const barraOscuraUbicacion = modalUbicacion.locator('div, button, p, a').filter({ hasText: textoABuscar }).first();
        if (await barraOscuraUbicacion.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`Haciendo clic en la dirección seleccionada: "${textoABuscar}"...`);
            await barraOscuraUbicacion.click({ force: true }).catch(async () => {
                await barraOscuraUbicacion.evaluate(el => el.click());
            });
            await this.page.waitForTimeout(1500);
        }

        // 6. Clic en botón Confirmar del modal si aparece
        const btnConfirmar = modalUbicacion.locator('button').filter({ hasText: /confirmar|aceptar|avançar|continuar/i }).first()
            .or(this.botonConfirmar.first());

        if (await btnConfirmar.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log("Haciendo clic en Confirmar ubicación...");
            await btnConfirmar.click().catch(() => {});
            await this.page.waitForTimeout(3000);
            await this.verificarLocalesCerrados();
        }

        await this.page.waitForTimeout(2000);

        // 7. Redirigir al menú si no cambió automáticamente
        if (!this.page.url().includes('/menu')) {
            console.log("Navegando directamente a /menu tras seleccionar ubicación de Delivery...");
            const currentUrl = this.page.url();
            const origin = new URL(currentUrl).origin;
            await this.page.goto(`${origin}/menu`, { waitUntil: 'domcontentloaded' }).catch(() => {});
            await this.page.waitForTimeout(3000);
        }
    }
}
