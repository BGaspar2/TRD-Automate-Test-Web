/**
 * Generador de documentos y datos dinámicos válidos para pruebas de registro por país.
 */

// ==========================================
// 🇪🇨 ECUADOR
// ==========================================

/**
 * Genera una cédula ecuatoriana válida utilizando el algoritmo de Módulo 10.
 * @returns {string} Cédula válida de 10 dígitos.
 */
export function generarCedulaEcuadorValida() {
    const provincia = Math.floor(Math.random() * 24) + 1;
    const provinciaStr = provincia.toString().padStart(2, '0');
    const tercerDigito = Math.floor(Math.random() * 6);
    const digitosConsecutivos = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

    const primeros9 = [
        parseInt(provinciaStr[0], 10),
        parseInt(provinciaStr[1], 10),
        tercerDigito,
        ...digitosConsecutivos
    ];

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = primeros9[i] * coeficientes[i];
        if (valor >= 10) valor -= 9;
        suma += valor;
    }

    const residuo = suma % 10;
    const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;

    return [...primeros9, digitoVerificador].join('');
}

export function generarTelefonoEcuador() {
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    return `09${random8}`;
}

// ==========================================
// 🇨🇱 CHILE
// ==========================================

/**
 * Genera un RUT chileno válido utilizando el algoritmo de Módulo 11.
 * @param {boolean} conGuion - Si debe incluir guión antes del dígito verificador.
 * @returns {string} RUT chileno válido (ej. 18234567-K o 18234567K).
 */
export function generarRutChileValido(conGuion = true) {
    const numero = Math.floor(12000000 + Math.random() * 15000000);
    const digitos = numero.toString().split('').reverse().map(Number);
    let suma = 0;
    let factor = 2;

    for (const d of digitos) {
        suma += d * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }

    const residuo = 11 - (suma % 11);
    let dv = '0';
    if (residuo === 11) dv = '0';
    else if (residuo === 10) dv = 'K';
    else dv = residuo.toString();

    return conGuion ? `${numero}-${dv}` : `${numero}${dv}`;
}

export function generarTelefonoChile() {
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    return `9${random8}`;
}

// ==========================================
// 🇨🇴 COLOMBIA
// ==========================================

/**
 * Genera una Cédula de Ciudadanía colombiana válida de 10 dígitos.
 * @returns {string} Cédula colombiana (ej. 10xxxxxxxx).
 */
export function generarCedulaColombiaValida() {
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    return `10${random8}`;
}

export function generarTelefonoColombia() {
    const prefijos = ['300', '310', '320', '315', '301'];
    const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const random7 = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefijo}${random7}`;
}

// ==========================================
// 🇦🇷 ARGENTINA
// ==========================================

/**
 * Genera un DNI argentino válido de 8 dígitos.
 * @returns {string} DNI de 8 dígitos (ej. 38xxxxxx o 42xxxxxx).
 */
export function generarDniArgentinaValido() {
    return Math.floor(30000000 + Math.random() * 20000000).toString();
}

export function generarTelefonoArgentina() {
    const random7 = Math.floor(1000000 + Math.random() * 9000000);
    return `911${random7}`;
}

// ==========================================
// 🇧🇷 BRASIL
// ==========================================

/**
 * Genera un CPF brasileño válido con algoritmo oficial de dos dígitos verificadores.
 * @returns {string} CPF de 11 dígitos numéricos válidos.
 */
export function generarCpfBrasilValido() {
    const primeros9 = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

    // Primer dígito verificador
    let suma1 = 0;
    for (let i = 0; i < 9; i++) {
        suma1 += primeros9[i] * (10 - i);
    }
    let dv1 = 11 - (suma1 % 11);
    if (dv1 >= 10) dv1 = 0;

    // Segundo dígito verificador
    const primeros10 = [...primeros9, dv1];
    let suma2 = 0;
    for (let i = 0; i < 10; i++) {
        suma2 += primeros10[i] * (11 - i);
    }
    let dv2 = 11 - (suma2 % 11);
    if (dv2 >= 10) dv2 = 0;

    return [...primeros9, dv1, dv2].join('');
}

export function generarTelefonoBrasil() {
    const ddds = ['11', '21', '31', '41', '51'];
    const ddd = ddds[Math.floor(Math.random() * ddds.length)];
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    return `${ddd}9${random8}`;
}

// ==========================================
// 🇻🇪 VENEZUELA
// ==========================================

/**
 * Genera una Cédula de Identidad venezolana de 8 dígitos.
 * @returns {string} Cédula venezolana.
 */
export function generarCedulaVenezuelaValida() {
    return Math.floor(15000000 + Math.random() * 15000000).toString();
}

export function generarTelefonoVenezuela() {
    const prefijos = ['414', '424', '412', '416'];
    const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const random7 = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefijo}${random7}`;
}

// ==========================================
// 👥 NOMBRES GLOBALES
// ==========================================

export function generarNombreAleatorio() {
    const nombres = ['Carlos', 'Andrea', 'Santiago', 'Camila', 'Mateo', 'Valentina', 'Sebastián', 'Lucía', 'Alejandro', 'Mariana', 'Diego', 'Paula'];
    const apellidos = ['Gómez', 'Mendoza', 'Morales', 'Castillo', 'Suárez', 'Paredes', 'Vargas', 'Ríos', 'Navarro', 'Andrade', 'Silva', 'Rojas'];

    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

    return { nombre, apellido };
}
