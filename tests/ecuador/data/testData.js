export const testData = {
    baseUrl: "https://kfc-ec-devops5-artisn.vercel.app",
    location: {
        searchQuery: "el inca",
        fullAddress: "El Inca, Quito, Ecuador"
    },
    order: {
        desiredQuantity: 3
    },
    deliveryAddress: {
        mainStreet: "Av. Eloy Alfaro",
        secondaryStreet: "Calle los Naranjos",
        number: "N37-188",
        reference: "Piso 3, Dpto. 302",
        phone: "0992013004",
        instructions: "Dejar con el guardia en garita."
    },
    customer: {
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        phone: "0981234567",
        document: "1712345678"
    },
    paymentMethodId: "#Efectivo",
    registration: {
        baseEmail: process.env.TEST_EMAIL || "bryan.gaspar@trade.ec",
        timeoutOtpMs: 55000
    }
};
