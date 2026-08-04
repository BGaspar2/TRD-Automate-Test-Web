import { expect } from '@playwright/test';

export class CartPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        this.modalCarrito = page.locator('.ProductInCartModal, [class*="ProductInCartModal"], [class*="cart-modal"]');
        this.btnIconoCarrito = page.locator('a[href*="/cart"], a[href*="/checkout"], [data-testid*="cart"], button:has(svg.feather-shopping-bag), .FloatingCart, .HeaderCart, .CartButton');
    }

    async procesarModalCarrito() {
        const modal = this.modalCarrito.first();
        const modalVis = await modal.isVisible({ timeout: 8000 }).catch(() => false);

        if (modalVis) {
            console.log("Modal de producto añadido detectado.");
            const btnVerCarrito = modal.getByRole('button', { name: /ver carrito|ir al carrito|carrito/i })
                .or(modal.locator('button, a').filter({ hasText: /carrito/i })).first();
            
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
        console.log("Navegando al checkout ('Ir a pagar')...");

        const candidatos = this.page.locator('.OrderTotal, button:has-text("Ir a pagar"), a:has-text("Ir a pagar"), button[type="submit"]')
            .filter({ hasText: /ir a pagar|pagar|proceder al pago|checkout/i });
            
        const count = await candidatos.count();
        let btnVisible = null;

        for (let i = 0; i < count; i++) {
            const candidato = candidatos.nth(i);
            if (await candidato.isVisible().catch(() => false)) {
                btnVisible = candidato;
                break;
            }
        }

        if (!btnVisible) {
            btnVisible = candidatos.first();
        }

        await btnVisible.scrollIntoViewIfNeeded().catch(() => {});
        await btnVisible.click();
        await this.page.waitForTimeout(5000);
    }
}
