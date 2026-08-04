import { expect } from '@playwright/test';

export class HomePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        this.botonDomicilio = page.getByRole('button', { name: /domicilio|delivery|entrega/i })
            .or(page.locator('button.Button, button, [role="button"]').filter({ hasText: /domicilio|delivery|entrega/i }));

        this.sinUbicacion = page.locator('.MissingLocationMessage, [class*="MissingLocation"], [class*="no-location"]');
        this.conUbicacion = page.locator('.DeliveryAddressMessage, [class*="DeliveryAddress"], [class*="address-message"]');

        this.searchInput = page.getByPlaceholder(/buscar dirección|dirección|ubicación|address/i)
            .or(page.locator('input[placeholder*="dirección"], input[placeholder*="Dirección"], input[type="search"]'));

        this.botonConfirmar = page.getByRole('button', { name: /confirmar|aceptar/i })
            .or(page.locator('button.Button, button, [role="button"]').filter({ hasText: /confirmar|aceptar/i }));
    }

    async navegar(url) {
        console.log(`Iniciando navegador y navegando a ${url}...`);
        await this.page.goto(url);
        await this.page.waitForTimeout(5000);
    }

    async seleccionarCanalDomicilio() {
        console.log("Seleccionando canal de compra: Domicilio...");
        const btn = this.botonDomicilio.first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.page.waitForTimeout(5000);
    }

    async configurarUbicacion(searchQuery, fullAddress) {
        const sinUbicacionVis = await this.sinUbicacion.first().isVisible({ timeout: 5000 }).catch(() => false);
        const conUbicacionVis = await this.conUbicacion.first().isVisible({ timeout: 5000 }).catch(() => false);

        if (sinUbicacionVis || conUbicacionVis) {
            if (sinUbicacionVis) {
                console.log("No se ha ingresado dirección, haciendo clic...");
                await this.sinUbicacion.first().click();
            } else {
                const direccionActual = await this.conUbicacion.first().innerText();
                console.log("La dirección ingresada es: ", direccionActual);
                console.log("Haciendo clic en la dirección existente para cambiarla...");
                await this.conUbicacion.first().click();
            }
            await this.page.waitForTimeout(1000);

            const input = this.searchInput.first();
            await expect(input).toBeVisible();
            await input.fill(searchQuery);
            await input.press('Enter');

            const opcionDropdown = this.page.locator('.Overlay, .SearchBar__dropdown')
                .getByText(fullAddress, { exact: false })
                .or(this.page.getByText(searchQuery, { exact: false }));
            
            await opcionDropdown.first().waitFor({ state: 'visible', timeout: 10000 });
            await opcionDropdown.first().click();

            const btnConfirmar = this.botonConfirmar.first();
            await btnConfirmar.waitFor({ state: 'visible', timeout: 10000 });
            await btnConfirmar.click();
            await this.page.waitForTimeout(5000);
        }
    }
}
