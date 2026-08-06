import { expect } from '@playwright/test';

export class CartPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Locators para modal y carrito
        this.modalCarrito = page.locator('.ProductInCartModal, [class*="ProductInCartModal"], [class*="cart-modal"]');
        this.btnIconoCarrito = page.locator('a[href*="/cart"], a[href*="/checkout"], [data-testid*="cart"], button:has(svg.feather-shopping-bag), .FloatingCart, .HeaderCart, .CartButton');

        // Locators para banners de validación de monto mínimo y máximo
        this.alertaMinimo = page.locator('.OrderMinimumAlert, [class*="minimum"], [class*="Alert"], [class*="alert"], [class*="Banner"]')
            .filter({ hasText: /pedido mínimo|mínimo es de|agrega más productos/i });

        this.alertaMaximo = page.locator('.OrderMaximumAlert, [class*="maximum"], [class*="Alert"], [class*="alert"], [class*="Banner"]')
            .filter({ hasText: /pedido máximo|máximo es de|supera el máximo|disminuye/i });

        // Botones de ajuste de cantidad en el carrito
        this.btnAumentarCantidad = page.locator('button:has-text("+"), [aria-label*="aumentar"], [class*="plus"], button:has(svg.feather-plus)').first();
        this.btnDisminuirCantidad = page.locator('button:has-text("-"), [aria-label*="disminuir"], [class*="minus"], button:has(svg.feather-minus)').first();
    }

    /**
     * Valida si el carrito cumple con el monto mínimo y no supera el monto máximo.
     * Si no cumple el mínimo, aumenta la cantidad (+). Si supera el máximo, disminuye (-).
     * @param {number} maxIntentos Límite máximo de reintentos para evitar bucles infinitos.
     */
    async validarYAjustarMontoCarrito(maxIntentos = 10) {
        console.log("Validando reglas de monto mínimo/máximo en el carrito...");

        // 1. Validar y ajustar pedido mínimo (Incrementar cantidad con +)
        let intentos = 0;
        while (await this.alertaMinimo.first().isVisible().catch(() => false) && intentos < maxIntentos) {
            const texto = await this.alertaMinimo.first().textContent().catch(() => '');
            console.log(`[Monto mínimo detectado]: "${texto.trim()}". Aumentando cantidad (+)...`);

            if (await this.btnAumentarCantidad.isVisible().catch(() => false)) {
                await this.btnAumentarCantidad.click().catch(() => {});
                await this.page.waitForTimeout(1000);
            } else {
                console.log("No se encontró el botón para aumentar cantidad en el carrito.");
                break;
            }
            intentos++;
        }

        // 2. Validar y ajustar pedido máximo (Disminuir cantidad con -)
        intentos = 0;
        while (await this.alertaMaximo.first().isVisible().catch(() => false) && intentos < maxIntentos) {
            const texto = await this.alertaMaximo.first().textContent().catch(() => '');
            console.log(`[Monto máximo detectado]: "${texto.trim()}". Disminuyendo cantidad (-)...`);

            if (await this.btnDisminuirCantidad.isVisible().catch(() => false)) {
                await this.btnDisminuirCantidad.click().catch(() => {});
                await this.page.waitForTimeout(1000);
            } else {
                console.log("No se encontró el botón para disminuir cantidad en el carrito.");
                break;
            }
            intentos++;
        }

        const sigueAlertaMinimo = await this.alertaMinimo.first().isVisible().catch(() => false);
        if (!sigueAlertaMinimo) {
            console.log("✓ Carrito validado correctamente con respecto a los montos requeridos.");
        } else {
            console.warn("⚠️ La alerta de pedido mínimo continúa visible tras ajustar la cantidad.");
        }
    }

    async procesarModalCarrito() {
        const modal = this.modalCarrito.first();
        const modalVis = await modal.isVisible({ timeout: 8000 }).catch(() => false);

        if (modalVis) {
            console.log("Modal de producto añadido detectado.");
            const btnVerCarrito = modal.getByRole('button', { name: /ver carrito|ir al carrito|carrinho|ver carrinho|ir para o carrinho/i })
                .or(modal.locator('button, a').filter({ hasText: /carrito|carrinho/i })).first();
            
            await btnVerCarrito.click().catch(() => {});
            console.log("Navegando al carrito desde el modal...");
        } else {
            console.log("El modal no se mostró o se cerró. Abriendo carrito mediante el botón/ícono de la interfaz...");
            const btnCartIcon = this.btnIconoCarrito.first();
            if (await btnCartIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
                await btnCartIcon.click().catch(() => {});
                console.log("Navegando al carrito mediante botón flotante/encabezado...");
            }
        }
        await this.page.waitForTimeout(5000);
    }

    async irAPagar() {
        console.log("Navegando al checkout ('Ir a pagar' / 'Ir para o pagamento')...");

        const candidatos = this.page.locator('.OrderTotal, button:has-text("Ir a pagar"), a:has-text("Ir a pagar"), button:has-text("Ir para o pagamento"), button[type="submit"]')
            .filter({ hasText: /ir a pagar|pagar|proceder|finalizar|checkout|ir para o pagamento|pagamento|fazer pedido|concluir/i });
            
        const count = await candidatos.count();
        let btnVisible = null;

        for (let i = 0; i < count; i++) {
            const candidato = candidatos.nth(i);
            if (await candidato.isVisible().catch(() => false)) {
                btnVisible = candidato;
                break;
            }
        }

        // Respaldo si no hay interacción directa
        if (!btnVisible) {
            btnVisible = candidatos.first();
        }

        await btnVisible.scrollIntoViewIfNeeded().catch(() => {});
        await btnVisible.click({ force: true }).catch(async () => {
            await btnVisible.evaluate(b => b.click());
        });
        await this.page.waitForTimeout(5000);
    }
}
