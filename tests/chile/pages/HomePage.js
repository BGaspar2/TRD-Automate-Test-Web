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

        this.searchInput = page.locator('.Overlay input, .Modal input, [class*="modal"] input, [class*="Overlay"] input, [class*="SearchBar"] input')
            .or(page.getByPlaceholder(/ingresa tu dirección|ingresa tu ubicación|buscar dirección|dirección|ubicación|address|endereço/i));

        this.botonConfirmar = page.getByRole('button', { name: /confirmar|aceptar|confirmar endereço|avançar/i })
            .or(page.locator('button.Button, button, [role="button"]').filter({ hasText: /confirmar|aceptar|confirmar endereço|avançar/i }));

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
            .filter({ hasText: /locales se encuentran cerrados|tiendas cerradas|lojas fechadas|intenta más tarde|cerrados/i }).first();

        if (await alertaCerrados.isVisible({ timeout: 2000 }).catch(() => false)) {
            const mensaje = await alertaCerrados.innerText().catch(() => 'Los locales se encuentran cerrados.');
            console.log(`⚠️ ALERTA DETECTADA: "${mensaje.trim()}". Omitiendo la prueba (test.skip)...`);
            test.skip(true, `Test omitido: ${mensaje.trim()}`);
        }
    }

    async seleccionarCanalDomicilio() {
        console.log("Seleccionando canal de compra: Domicilio...");
        const btn = this.botonDomicilio.first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.page.waitForTimeout(5000);
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
            const inputBusquedaModal = this.page.getByPlaceholder(/buscar locales|locales cerca|buscar dirección|dirección|ubicación|address|endereço|pesquisar|buscar/i)
                .or(this.page.locator('input[placeholder*="locales"], input[placeholder*="Locales"], input[placeholder*="dirección"], input[placeholder*="endereço"], input[type="search"], input[type="text"]')).first();

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

        // 1. Buscar si hay botón explícito de 'Seleccionar tienda' / 'Selecionar loja'
        const btnSeleccionar = this.botonSeleccionarTienda.first();
        if (await btnSeleccionar.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log("Haciendo clic en 'Seleccionar tienda' / 'Selecionar loja'...");
            await btnSeleccionar.click();
            await this.page.waitForTimeout(4000);
            return;
        }

        // 2. Buscar si hay botón de 'Ver/Mostrar más tiendas'
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

        // 3. Localizar y hacer clic en la tarjeta de tienda (encadenando .or() antes de .first())
        console.log("Buscando la tarjeta de la tienda en el listado...");
        
        const locatorCadena = this.page.getByText(/CC KFC ALTO PALERMO|CC KFC MERLO|CC KFC RECOLETA|CC KFC GUEMES|CC KFC|VILA OLIMPA|GUARDIA VIEJA|TOBERIN|EL INCA/i)
            .or(this.page.locator('div[class*="cursor-pointer"][class*="p-3"]'))
            .or(this.page.locator('div.flex.cursor-pointer.p-3'))
            .or(this.page.locator('p').filter({ hasText: /CC KFC|ALTO PALERMO|VILA|GUARDIA|TOBERIN|EL INCA/i }));

        const opcionTienda = locatorCadena.first();

        await opcionTienda.waitFor({ state: 'visible', timeout: 15000 }).catch(err => {
            console.log("Timeout esperando tarjeta de tienda:", err.message);
        });

        if (await opcionTienda.isVisible().catch(() => false)) {
            console.log("Haciendo clic en la tienda para confirmar selección...");
            await opcionTienda.scrollIntoViewIfNeeded().catch(() => {});
            
            // Clic via Playwright + invocar onClick de React
            await opcionTienda.click({ force: true }).catch(async () => {
                await opcionTienda.evaluate(el => el.click());
            });
            await opcionTienda.evaluate(el => {
                const card = el.closest('div[class*="cursor-pointer"]') || el;
                card.click();
                const reactKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
                if (reactKey && card[reactKey] && typeof card[reactKey].onClick === 'function') {
                    card[reactKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
                }
            }).catch(() => {});
            
            await this.page.waitForTimeout(3000);

            // Si aparece modal de confirmación de carrito
            const btnConfirmar = this.page.getByRole('button', { name: /aceptar|confirmar|cambiar|continuar|ir al menú|sim|sí/i }).first();
            if (await btnConfirmar.isVisible({ timeout: 1500 }).catch(() => false)) {
                console.log("Confirmando modal de cambio de tienda...");
                await btnConfirmar.click().catch(async () => {
                    await btnConfirmar.evaluate(b => b.click());
                });
                await this.page.waitForTimeout(2000);
            }

            // Verificar si la URL ya cambió a /menu
            if (!this.page.url().includes('/menu')) {
                console.log("Modal abierto tras selección. Forzando navegación directa al menú (/menu)...");
                const currentUrl = this.page.url();
                const origin = new URL(currentUrl).origin;
                await this.page.goto(`${origin}/menu`, { waitUntil: 'domcontentloaded' }).catch(() => {});
                await this.page.waitForTimeout(3000);
            }

            // Esperar a que las categorías del menú estén cargadas
            await this.page.waitForSelector('.CategoriesGrid, [class*="CategoriesGrid"], a figure', { timeout: 15000 }).catch(() => {});
            await this.page.waitForTimeout(2000);
        } else {
            console.log("No se pudo seleccionar la tienda en la lista.");
        }
    }

    async configurarUbicacion(searchQuery, fullAddress) {
        console.log("Configurando ubicación para entrega a domicilio...");

        // 1. Abrir siempre el modal de dirección haciendo clic en 'INGRESA TU UBICACIÓN' / Selector del navbar
        const btnAbrirUbicacion = this.page.getByText(/ingresa tu ubicación|ingresa tu ubicacion|ingresar dirección|selecciona tu ubicación|seleccionar ubicación|endereço/i)
            .or(this.sinUbicacion)
            .or(this.conUbicacion).first();

        if (await btnAbrirUbicacion.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log("Haciendo clic en 'INGRESA TU UBICACIÓN' / Selector de ubicación del encabezado...");
            await btnAbrirUbicacion.click({ force: true }).catch(async () => {
                await btnAbrirUbicacion.evaluate(b => b.click());
            });
            await this.page.waitForTimeout(2000);
        }

        // 2. Buscar el input dentro del modal de ubicación (excluyendo el buscador del navbar)
        const modalInput = this.page.locator('.Overlay input, .Modal input, [class*="modal"] input, [class*="Overlay"] input, [class*="SearchBar"] input')
            .first()
            .or(this.searchInput.first());

        if (await modalInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log(`Escribiendo ubicación en el modal: "${searchQuery}"...`);
            await modalInput.click().catch(() => {});
            await modalInput.fill(searchQuery);
            await modalInput.press('Enter');
            await this.page.waitForTimeout(1500);
        } else {
            console.log("⚠️ No se encontró el input del modal de ubicación.");
        }

        // 3. Seleccionar sugerencia en dropdown
        const textoABuscar = fullAddress || searchQuery;
        const opcionDropdown = this.page.locator('.Overlay, .SearchBar__dropdown, [class*="dropdown"], [class*="suggestion"], [class*="Overlay"]')
            .getByText(textoABuscar, { exact: false })
            .or(this.page.getByText(searchQuery, { exact: false }));
        
        if (await opcionDropdown.first().isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log(`Seleccionando opción de dirección: "${textoABuscar}"...`);
            await opcionDropdown.first().click().catch(() => {});
            await this.page.waitForTimeout(1500);
        }

        await this.verificarLocalesCerrados();

        // 4. Clic en tarjeta/barra oscura de dirección seleccionada
        const barraOscuraUbicacion = this.page.locator('div, button, p, a').filter({ hasText: textoABuscar }).first();
        if (await barraOscuraUbicacion.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`Haciendo clic en la tarjeta/barra de dirección seleccionada: "${textoABuscar}"...`);
            await barraOscuraUbicacion.click({ force: true }).catch(async () => {
                await barraOscuraUbicacion.evaluate(el => el.click());
            });
            await this.page.waitForTimeout(1500);
        }

        // 5. Clic en botón Confirmar si aparece
        const btnConfirmar = this.botonConfirmar.first()
            .or(this.page.locator('button').filter({ hasText: /confirmar|aceptar|avançar|continuar/i })).first();

        if (await btnConfirmar.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log("Haciendo clic en Confirmar ubicación...");
            await btnConfirmar.click().catch(() => {});
            await this.page.waitForTimeout(3000);
            await this.verificarLocalesCerrados();
        }

        await this.page.waitForTimeout(2000);

        // 6. Fallback de seguridad: si no ha redirigido al menú, ir a /menu directamente
        if (!this.page.url().includes('/menu')) {
            console.log("Navegando directamente a /menu tras seleccionar ubicación de Delivery...");
            const currentUrl = this.page.url();
            const origin = new URL(currentUrl).origin;
            await this.page.goto(`${origin}/menu`, { waitUntil: 'domcontentloaded' }).catch(() => {});
            await this.page.waitForTimeout(3000);
        }
    }
}
