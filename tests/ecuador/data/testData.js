export const testData = {
    baseUrl: "https://kfc-ec-devops5-artisn.vercel.app/",
    location: {
        searchQuery: "el inca",
        fullAddress: "El Inca, Quito, Ecuador"
    },
    order: {
        desiredQuantity: 3
    },
    deliveryAddress: {
        mainStreet: "Av. Amazonas",
        secondaryStreet: "Naciones Unidas",
        number: "N34-120",
        reference: "Edificio Amazonas Plaza",
        phone: "0991234567",
        instructions: "Dejar en recepción."
    },
    customer: {
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "0991234567",
        document: "1712345678"
    },
    paymentMethods: {
        puntoDeVenta: "Punto de Venta",
        efectivoExacto: "Efectivo (Monto Exacto)",
        efectivoCambio: "Efectivo (Con Cambio)"
    },
    montoCambio: "50",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
