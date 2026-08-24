export const testData = {
    baseUrl: "https://kfc-ve-devops5-artisn.vercel.app",
    location: {
        searchQuery: "Sabana Grande",
        fullAddress: "Sabana Grande"
    },
    order: {
        desiredQuantity: 3
    },
    deliveryAddress: {
        mainStreet: "Av. Abraham Lincoln",
        secondaryStreet: "Calle Real de Sabana Grande",
        number: "Edif. Centro",
        reference: "Piso 2",
        phone: "4141234567",
        instructions: "Llamar al llegar."
    },
    customer: {
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "4141234567",
        document: "V12345678"
    },
    paymentMethod: "Punto de venta", // 'Punto de venta' o 'Efectivo (con cambio)'
    paymentMethods: {
        puntoDeVenta: "Punto de venta",
        efectivoConCambio: "Efectivo (con cambio)"
    },
    montoCambio: "20",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
