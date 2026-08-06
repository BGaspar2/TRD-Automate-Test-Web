import { expect } from '@playwright/test';

export class MenuPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Locators resilientes con fallbacks
        this.categorias = page.locator('.CategoriesGrid a figure, .CategoriesGrid a, [class*="CategoriesGrid"] a');
        this.tarjetasProductos = page.locator('.ProductCard, [class*="ProductCard"], [data-testid^="product-"]');
        this.contenedorTotales = page.locator('.ProductTotals, [class*="ProductTotals"], [class*="totals"]');

        this.btnSumar = page.locator('.ProductTotals button:has(svg.feather-plus), .ProductTotals button:has-text("+"), [class*="Counter"] button:has(svg.feather-plus)')
            .or(page.locator('button:has(svg.feather-plus)'));

        this.contadorTexto = page.locator('.ProductTotals .Counter__quantity, [class*="quantity"], [class*="Counter__quantity"]');

        this.btnAgregarCarrito = page.getByTestId('add-to-cart')
            .or(page.getByRole('button', { name: /agregar al carrito|añadir al carrito|confirmar/i }))
            .or(page.locator('button[data-testid="add-to-cart"]'));

        this.gruposModificadores = page.locator('.ProductForm .ModifiersGroup, [class*="ModifiersGroup"], [class*="ModifierGroup"]');
    }

    async seleccionarCategoriaAleatoria() {
        console.log("Esperando a que las categorías del menú estén cargadas...");
        await this.categorias.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
        const totalCategorias = await this.categorias.count();
        if (totalCategorias === 0) {
            console.log("No se detectaron categorías inmediatamente, reintentando tras espera...");
            await this.page.waitForTimeout(3000);
        }
        const countFinal = await this.categorias.count();
        const indiceAleatorio = Math.floor(Math.random() * (countFinal || 1));
        console.log(`Seleccionando categoría aleatoria (${indiceAleatorio + 1} de ${countFinal})...`);
        const cat = this.categorias.nth(indiceAleatorio);
        await cat.scrollIntoViewIfNeeded().catch(() => {});
        await cat.click();
        await this.page.waitForTimeout(3000);
    }

    async seleccionarProductoAleatorio() {
        await this.tarjetasProductos.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
        let totalProductos = await this.tarjetasProductos.count();
        if (totalProductos === 0) {
            await this.page.waitForTimeout(3000);
            totalProductos = await this.tarjetasProductos.count();
        }

        const indiceAleatorio = Math.floor(Math.random() * totalProductos);
        console.log(`Seleccionando producto aleatorio (${indiceAleatorio + 1} de ${totalProductos}) y haciendo clic en Agregar...`);
        const tarjeta = this.tarjetasProductos.nth(indiceAleatorio);
        await tarjeta.scrollIntoViewIfNeeded().catch(() => {});

        // Estrategia de detección de botón: texto "Agregar/Añadir/+", ícono SVG feather-plus, botón CSS o tarjeta directa
        let btnAgregar = tarjeta.locator('button').filter({ hasText: /agregar|añadir|\+/i }).first();
        if (!(await btnAgregar.isVisible({ timeout: 1500 }).catch(() => false))) {
            btnAgregar = tarjeta.locator('button:has(svg.feather-plus), button.Button, [role="button"]').first();
        }
        if (!(await btnAgregar.isVisible({ timeout: 1500 }).catch(() => false))) {
            btnAgregar = tarjeta.locator('button, a').first();
        }
        if (!(await btnAgregar.isVisible({ timeout: 1500 }).catch(() => false))) {
            btnAgregar = tarjeta;
        }

        await btnAgregar.scrollIntoViewIfNeeded().catch(() => {});
        await btnAgregar.click();
        await this.page.waitForTimeout(5000);
    }

    async ajustarCantidad(cantidadDeseada) {
        const contenedor = this.contenedorTotales.first();
        await contenedor.waitFor({ state: 'visible' });

        const contador = this.contadorTexto.first();
        let cantidadActual = parseInt(await contador.innerText());
        console.log(`Paso 1: Aumentando cantidad de ${cantidadActual} a ${cantidadDeseada}...`);

        const sumarBtn = this.btnSumar.first();

        if (await sumarBtn.isDisabled().catch(() => false)) {
            console.log("El botón '+' está deshabilitado. Seleccionando modificadores obligatorios...");
            await this.validarYSeleccionarModificadores();
        }

        let reintentos = 0;
        while (cantidadActual < cantidadDeseada && reintentos < 10) {
            if (await sumarBtn.isEnabled().catch(() => false)) {
                await sumarBtn.click();
                await this.page.waitForTimeout(300);
                cantidadActual = parseInt(await contador.innerText());
            } else {
                await this.validarYSeleccionarModificadores();
            }
            reintentos++;
        }
    }

    async validarYSeleccionarModificadores() {
        console.log("Validando modificadores obligatorios...");
        const totalGrupos = await this.gruposModificadores.count();

        for (let i = 0; i < totalGrupos; i++) {
            const grupo = this.gruposModificadores.nth(i);
            const titulo = await grupo.locator('h3, h4, [class*="title"]').first().innerText().catch(() => `Grupo ${i + 1}`);
            const contadorElemento = grupo.locator('.ReadonlyCounter, [class*="Counter"], [class*="counter"]').first();
            const mensajeError = grupo.locator('[class*="danger"], [class*="error"], p:has-text("Debes escoger"), p:has-text("escoger")').first();

            let requiereSeleccion = false;
            let faltantes = 1;

            if (await contadorElemento.isVisible({ timeout: 1500 }).catch(() => false)) {
                const textoContador = await contadorElemento.innerText();
                const match = textoContador.match(/(\d+)\s*\/\s*(\d+)/);

                if (match) {
                    const actual = parseInt(match[1]);
                    const requerido = parseInt(match[2]);
                    if (actual < requerido) {
                        requiereSeleccion = true;
                        faltantes = requerido - actual;
                    }
                } else if (textoContador.includes('0 /') || textoContador.startsWith('0')) {
                    requiereSeleccion = true;
                    faltantes = 1;
                }
            } else if (await mensajeError.isVisible({ timeout: 1000 }).catch(() => false)) {
                requiereSeleccion = true;
                faltantes = 1;
            }

            if (requiereSeleccion) {
                console.log(`Falta seleccionar en "${titulo}" (faltan ${faltantes} opciones). Seleccionando...`);

                for (let k = 0; k < faltantes; k++) {
                    const radioOption = grupo.locator('.RadioModifier label, input[type="radio"] + label, label').nth(k);
                    if (await radioOption.isVisible({ timeout: 1000 }).catch(() => false)) {
                        await radioOption.click().catch(() => {});
                        await this.page.waitForTimeout(300);
                        continue;
                    }

                    const plusBtn = grupo.locator('.CounterModifier button:has(svg.feather-plus), button:has(svg.feather-plus), button:has-text("+")').first();
                    if (await plusBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                        await plusBtn.click().catch(() => {});
                        await this.page.waitForTimeout(300);
                    }
                }
            } else {
                console.log(`Modificador listo en: "${titulo}".`);
            }
        }
    }

    async agregarAlCarrito(cantidadDeseada) {
        console.log("Paso 2: Confirmando y agregando al carrito...");
        let btn = this.btnAgregarCarrito.first();
        if (!(await btn.isVisible({ timeout: 2000 }).catch(() => false))) {
            btn = this.contenedorTotales.locator('button').filter({ hasText: /agregar|añadir|confirmar/i }).first();
        }
        await expect(btn).toBeVisible();
        await btn.click();
        console.log(`¡Listo! Se agregaron ${cantidadDeseada} unidades al pedido.`);
        await this.page.waitForTimeout(5000);
    }
}
