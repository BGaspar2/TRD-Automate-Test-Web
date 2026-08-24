/**
 * Generador de datos dinámicos y válidos para pruebas de registro por país.
 */

/**
 * Genera una cédula ecuatoriana válida utilizando el algoritmo de Módulo 10.
 * @returns {string} Cédula válida de 10 dígitos.
 */
export function generarCedulaEcuadorValida() {
    // Código de provincia entre 01 y 24
    const provincia = Math.floor(Math.random() * 24) + 1;
    const provinciaStr = provincia.toString().padStart(2, '0');

    // Tercer dígito menor a 6 para personas naturales (0 a 5)
    const tercerDigito = Math.floor(Math.random() * 6);

    // Siguientes 6 dígitos aleatorios
    const digitosConsecutivos = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

    const primeros9 = [
        parseInt(provinciaStr[0], 10),
        parseInt(provinciaStr[1], 10),
        tercerDigito,
        ...digitosConsecutivos
    ];

    // Algoritmo módulo 10
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = primeros9[i] * coeficientes[i];
        if (valor >= 10) {
            valor -= 9;
        }
        suma += valor;
    }

    const residuo = suma % 10;
    const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;

    return [...primeros9, digitoVerificador].join('');
}

/**
 * Genera un número de teléfono celular válido para Ecuador (09xxxxxxxx)
 * @returns {string} Teléfono de 10 dígitos iniciando en 09
 */
export function generarTelefonoEcuador() {
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    return `09${random8}`;
}

/**
 * Genera nombres y apellidos aleatorios para pruebas
 * @returns {{ nombre: string, apellido: string }}
 */
export function generarNombreAleatorio() {
    const nombres = ['Carlos', 'Andrea', 'Santiago', 'Camila', 'Mateo', 'Valentina', 'Sebastián', 'Lucía', 'Alejandro', 'Mariana'];
    const apellidos = ['Gómez', 'Mendoza', 'Morales', 'Castillo', 'Suárez', 'Paredes', 'Vargas', 'Ríos', 'Navarro', 'Andrade'];

    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

    return { nombre, apellido };
}
