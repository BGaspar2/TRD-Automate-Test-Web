import readline from 'readline';

/**
 * Genera un correo único con alias dinámico (sub-addressing con '+')
 * para garantizar que KFC lo trate como un usuario nuevo en cada ejecución,
 * mientras que el correo llega a la bandeja de entrada real.
 * 
 * Ejemplo: base "mi_correo@gmail.com" -> "mi_correo+ec_1719203948@gmail.com"
 * 
 * @param {string} baseEmail - Correo base del usuario
 * @param {string} [prefijo='ec'] - Prefijo de país o prueba
 * @returns {string} Correo con alias dinámico
 */
export function generarEmailConAlias(baseEmail = 'qa.kfc.latam@gmail.com', prefijo = 'ec') {
    if (!baseEmail.includes('@')) {
        throw new Error(`El formato del correo base '${baseEmail}' no es válido.`);
    }

    const [usuarioOriginal, dominio] = baseEmail.split('@');
    // Remover alias previos si existían
    const usuarioLimpio = usuarioOriginal.split('+')[0];
    const timestamp = Date.now().toString(36);

    return `${usuarioLimpio}+${prefijo}_${timestamp}@${dominio}`;
}

/**
 * Solicita interactivamente el código OTP al usuario en su terminal con temporizador
 * @param {string} emailDestino - Correo donde se envió el OTP
 * @param {number} [timeoutMs=55000] - Tiempo máximo de espera antes de expirar (ms)
 * @returns {Promise<string>} Código OTP ingresado
 */
export async function pedirOtpPorConsola(emailDestino, timeoutMs = 55000) {
    return new Promise((resolve, reject) => {
        console.log("\n========================================================");
        console.log(`📩 CÓDIGO OTP SOLICITADO PARA: [ ${emailDestino} ]`);
        console.log("👉 1. Abre tu correo y copia el código de 6 dígitos.");
        console.log("👉 2. Escríbelo aquí en la terminal y presiona ENTER:");
        console.log("========================================================\n");

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const timer = setTimeout(() => {
            rl.close();
            reject(new Error(`Timeout: No se ingresó el código OTP en la terminal tras ${timeoutMs / 1000}s.`));
        }, timeoutMs);

        rl.question('🔑 Código OTP: ', (respuesta) => {
            clearTimeout(timer);
            rl.close();

            const codigoLimpio = respuesta.trim().replace(/\D/g, '');
            if (!codigoLimpio || codigoLimpio.length < 4) {
                reject(new Error(`Código OTP inválido ingresado: '${respuesta}'`));
            } else {
                console.log(`✅ Código recibido: [ ${codigoLimpio} ]. Continuando con la automatización...\n`);
                resolve(codigoLimpio);
            }
        });
    });
}
