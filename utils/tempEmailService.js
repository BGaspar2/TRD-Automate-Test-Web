/**
 * Servicio de Correo Desechable / Temporal 100% Automatizado
 * Integración con la API REST de GuerrillaMail y extracción precisa de OTP de KFC.
 */

export class TempEmailService {
    constructor() {
        this.guerrillaApi = 'https://api.guerrillamail.com/ajax.php';
        this.mailTmApi = 'https://api.mail.tm';
    }

    /**
     * Crea un buzón de correo desechable en GuerrillaMail
     * @param {string} [prefijo='kfcqa']
     * @returns {Promise<{ email: string, token: string, provider: 'guerrilla'|'mailtm' }>}
     */
    async crearBuzon(prefijo = 'kfcqa') {
        const cleanPrefix = prefijo.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'kfcqa';
        const randomId = Math.random().toString(36).substring(2, 7);
        const username = `${cleanPrefix}${randomId}`;

        try {
            // 1. Obtener sesión base de GuerrillaMail
            const resInit = await fetch(`${this.guerrillaApi}?f=get_email_address`);
            const dataInit = await resInit.json();
            const sidToken = dataInit.sid_token;

            // 2. Establecer nombre personalizado
            const resUser = await fetch(`${this.guerrillaApi}?f=set_email_user&email_user=${username}&lang=es&sid_token=${sidToken}`);
            const dataUser = await resUser.json();

            const emailGenerado = dataUser.email_addr;
            console.log(`📬 [Buzón Temporal Creado] Correo: ${emailGenerado}`);

            return {
                email: emailGenerado,
                token: sidToken,
                provider: 'guerrilla'
            };
        } catch (error) {
            console.log(`(Aviso GuerrillaMail: ${error.message}. Utilizando proveedor de respaldo...)`);
            return await this.crearBuzonMailTm(cleanPrefix);
        }
    }

    /**
     * Proveedor secundario de respaldo (Mail.tm)
     */
    async crearBuzonMailTm(cleanPrefix) {
        const resDom = await fetch(`${this.mailTmApi}/domains`);
        const dataDom = await resDom.json();
        const dominio = (dataDom['hydra:member'] || [])[0]?.domain || 'emalupe.com';

        const timestamp = Date.now().toString(36);
        const email = `${cleanPrefix}${timestamp}@${dominio}`;
        const password = 'KfcTestPassword123!';

        const resCrear = await fetch(`${this.mailTmApi}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
        });
        const cuenta = await resCrear.json();
        const address = cuenta.address || email;

        const resToken = await fetch(`${this.mailTmApi}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const dataToken = await resToken.json();

        return {
            email: address,
            token: dataToken.token,
            provider: 'mailtm'
        };
    }

    /**
     * Espera a que llegue el correo de KFC y extrae el código OTP real limpiando tags HTML
     * 
     * @param {{ email: string, token: string, provider: string }} buzon
     * @param {Object} [opciones]
     * @param {number} [opciones.timeoutMs=60000] - Tiempo máximo de espera (ms)
     * @param {number} [opciones.intervaloMs=2500] - Intervalo entre consultas (ms)
     * @returns {Promise<{ codigo: string, asunto: string, remitente: string }>}
     */
    async esperarCodigoOtp(buzon, opciones = {}) {
        const {
            timeoutMs = 60000,
            intervaloMs = 2500
        } = opciones;

        const inicio = Date.now();
        console.log(`⏳ [Búsqueda Automática] Monitoreando bandeja de ${buzon.email} (Timeout: ${timeoutMs / 1000}s)...`);

        while (Date.now() - inicio < timeoutMs) {
            try {
                if (buzon.provider === 'guerrilla') {
                    const resCheck = await fetch(`${this.guerrillaApi}?f=check_email&seq=0&sid_token=${buzon.token}`);
                    if (resCheck.ok) {
                        const data = await resCheck.json();
                        const lista = data.list || [];

                        for (const item of lista) {
                            // Ignorar el mensaje de bienvenida de Guerrilla
                            if (item.mail_from?.includes('guerrillamail.com') || item.mail_subject?.includes('Welcome')) {
                                continue;
                            }

                            console.log(`📩 Mensaje detectado: "${item.mail_subject}" de ${item.mail_from}`);

                            // Obtener cuerpo completo del mensaje
                            const resBody = await fetch(`${this.guerrillaApi}?f=fetch_email&email_id=${item.mail_id}&sid_token=${buzon.token}`);
                            const dataBody = await resBody.json();
                            const rawHtml = dataBody.mail_body || dataBody.mail_excerpt || '';

                            // Limpiar estilos y etiquetas HTML para obtener solo texto plano legible
                            const textoLimpio = rawHtml
                                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                                .replace(/<[^>]+>/g, ' ')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();

                            console.log(`📄 [Texto limpio del correo]: "${textoLimpio.substring(0, 180)}..."`);

                            // 1. Prioridad: Buscar 6 dígitos inmediatamente después de "CÓDIGO" o "VERIFICAR TU CUENTA"
                            const matchPrioritario = textoLimpio.match(/(?:INGRESA EL C[ÓO]DIGO|VERIFICAR TU CUENTA|C[ÓO]DIGO DE VERIFICACI[ÓO]N)[^\d]{0,50}?(\d{6})/i);
                            if (matchPrioritario && matchPrioritario[1]) {
                                const codigo = matchPrioritario[1];
                                console.log(`🔑 ¡Código OTP extraído con precisión!: [ ${codigo} ]`);
                                return { codigo, asunto: dataBody.mail_subject, remitente: dataBody.mail_from };
                            }

                            // 2. Prioridad: Buscar 6 dígitos antes de "Vigencia del código" o "minutos"
                            const matchVigencia = textoLimpio.match(/(\d{6})\s*(?:Vigencia del c[óo]digo|minutos)/i);
                            if (matchVigencia && matchVigencia[1]) {
                                const codigo = matchVigencia[1];
                                console.log(`🔑 ¡Código OTP extraído por patrón de vigencia!: [ ${codigo} ]`);
                                return { codigo, asunto: dataBody.mail_subject, remitente: dataBody.mail_from };
                            }

                            // 3. Fallback: Primer número de 6 dígitos que aparezca en el texto plano
                            const matchFallback = textoLimpio.match(/\b\d{6}\b/);
                            if (matchFallback) {
                                const codigo = matchFallback[0];
                                console.log(`🔑 ¡Código OTP extraído por coincidencia numérica!: [ ${codigo} ]`);
                                return { codigo, asunto: dataBody.mail_subject, remitente: dataBody.mail_from };
                            }
                        }
                    }
                } else {
                    // Fallback Mail.tm
                    const res = await fetch(`${this.mailTmApi}/messages`, {
                        headers: { 'Authorization': `Bearer ${buzon.token}`, 'Accept': 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const mensajes = data['hydra:member'] || [];
                        if (mensajes.length > 0) {
                            const msg = mensajes[0];
                            const resDetalle = await fetch(`${this.mailTmApi}/messages/${msg.id}`, {
                                headers: { 'Authorization': `Bearer ${buzon.token}` }
                            });
                            const detalle = await resDetalle.json();
                            const textoLimpio = `${detalle.subject || ''} ${detalle.intro || ''} ${detalle.text || ''}`
                                .replace(/<[^>]+>/g, ' ')
                                .replace(/\s+/g, ' ');

                            const match = textoLimpio.match(/(?:INGRESA EL C[ÓO]DIGO|VERIFICAR TU CUENTA|C[ÓO]DIGO)[^\d]{0,50}?(\d{6})/i) || textoLimpio.match(/\b\d{6}\b/);
                            if (match) {
                                const codigo = match[1] || match[0];
                                console.log(`🔑 ¡Código OTP extraído de Mail.tm!: [ ${codigo} ]`);
                                return { codigo, asunto: detalle.subject, remitente: detalle.from?.address };
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`(Consultando bandeja... ${err.message})`);
            }

            await new Promise(r => setTimeout(r, intervaloMs));
        }

        throw new Error(`Timeout: No se recibió ningún correo con código OTP en ${buzon.email} tras ${timeoutMs / 1000}s.`);
    }
}

export const tempEmailService = new TempEmailService();
