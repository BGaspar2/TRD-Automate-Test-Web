import { expect } from '@playwright/test';

export class MenuPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

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

            if (await contadorElemento.isVisible({ timeout: 1500 }).catch(() => false)) {
                let textoContador = await contadorElemento.innerText();
                let numeros = textoContador.match(/\d+/g);

                if (numeros && numeros.length >= 2) {
                    let actual = parseInt(numeros[0]);
                    let requerido = parseInt(numeros[1]);

                    if (actual < requerido) {
                        console.log(`Falta seleccionar en: "${titulo}" (${textoContador.replace(/\n/g, '')}). Seleccionando opciones necesarias (${actual}/${requerido})...`);
                        let intentos = 0;
                        while (actual < requerido && intentos < 10) {
                            intentos++;
                            let clicHecho = false;

                            const botonesMas = grupo.locator('.CounterModifier button:has(svg.feather-plus), button:has(svg.feather-plus)');
                            const totalMas = await botonesMas.count();
                            if (totalMas > 0) {
                                const ind = Math.min(actual, totalMas - 1);
                                if (await botonesMas.nth(ind).isVisible()) {
                                    await botonesMas.nth(ind).click();
                                    await this.page.waitForTimeout(300);
                                    clicHecho = true;
                                }
                            }

                            if (!clicHecho) {
                                const opciones = grupo.locator('.RadioModifier label, .CheckboxModifier label, label');
                                const totalOpciones = await opciones.count();
                                if (totalOpciones > 0) {
                                    const ind = Math.min(actual, totalOpciones - 1);
                                    if (await opciones.nth(ind).isVisible()) {
                                        await opciones.nth(ind).click();
                                        await this.page.waitForTimeout(300);
                                        clicHecho = true;
                                    }
                                }
                            }

                            if (!clicHecho) break;
                            actual++;
                        }
                    }
                } else if (textoContador.includes('0 /') || textoContador.startsWith('0')) {
                    console.log(`Falta seleccionar en: "${titulo}". Eligiendo primera opción...`);
                    const primerRadio = grupo.locator('.RadioModifier label, label').first();
                    if (await primerRadio.isVisible({ timeout: 1000 }).catch(() => false)) {
                        await primerRadio.click();
                        await this.page.waitForTimeout(200);
                    }
                }
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
