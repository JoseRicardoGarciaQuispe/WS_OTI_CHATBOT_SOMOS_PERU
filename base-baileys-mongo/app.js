/**
 * PUNTO DE ENTRADA: CONFIGURACIÓN INICIAL DEL BOT DE WHATSAPP
 * Este archivo configura un bot de WhatsApp para proporcionar información sobre servicios.
 */
// 1. IMPORTACIÓN DE DEPENDENCIAS
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');

// 2. GESTIÓN DE ESTADO
// Almacena temporalmente los códigos del flujo en donde se encuentra el usuario (número de WhatsApp)
const userStates = new Map();

// 3. FLUJO DE BIENVENIDA
const flowWelcome = addKeyword(['HOLA', 'OLA', 'BUENAS'])
    .addAction(async (ctx, { flowDynamic }) => {
        // Mostrar el logo de la empresa con descripción
        await flowDynamic({
            body: 'Bienvenido a Somos Marketing Perú',
            media: 'https://i.imgur.com/W1kmj6Q.png'
        });

        // Saludo y descripción
        await flowDynamic([
            '👋 ¡Hola! Te saluda el equipo de *Somos Marketing Perú*! 🌟',
            'Somos una agencia de marketing digital dedicada a impulsar el crecimiento de tu negocio.',
            '🌟 *Menú Principal* 🌟',
            '1️⃣ Consultar Servicios',
            '2️⃣ Contactar Soporte',
            '3️⃣ Salir'
        ]);
    });

// 4. FLUJO DE SERVICIOS
const flowServicios = addKeyword(['1'])
    .addAction(async (ctx, { flowDynamic }) => {
        await flowDynamic([
            'A continuación, te presentamos un resumen de nuestros servicios clave (precios referenciales):',
            '',
            '1️⃣ *Publicaciones en Redes Sociales (4 al mes)* - S/. 100',
            '2️⃣ *Campaña de Marketing en Facebook Ads (4 campañas)* - S/. 80 por campaña',
            '3️⃣ *Implementación de Asistente Informativo (Chatbot)* - S/. 20',
            '',
            'Contamos con 30 días de validez en nuestras cotizaciones.',
        ]);
        // Almacenar el estado de espera
        userStates.set(ctx.from, 'waitingForResponse');
        // Esperar cualquier mensaje del usuario
        await flowDynamic('Por favor, escribe cualquier mensaje para continuar.');
    });

// 5. FLUJO DE RESPUESTA DESPUÉS DE LA COTIZACIÓN
const flowResponseAfterQuote = addKeyword([]) // Capturar cualquier mensaje
    .addAction(async (ctx, { flowDynamic }) => {
        // Verificar si el usuario está en el estado de espera
        if (userStates.get(ctx.from) === 'waitingForResponse') {
            await flowDynamic([
                '🤝 Agradecemos tu interés en nuestros servicios. Un asesor se pondrá en contacto contigo en breve.',
                '⏳ Tiempo estimado de respuesta: entre 10 y 15 minutos.',
                'Si tienes alguna otra consulta, no dudes en preguntar.'
            ]);
            // Limpiar el estado del usuario
            userStates.delete(ctx.from);
        } else {
            // Si el usuario no está en el estado de espera, no activar el flujo de callback
            await flowDynamic('Lo siento, no puedo procesar tu solicitud en este momento.');
        }
    });

// 6. FLUJO DE CALLBACK
const flowCallback = addKeyword([])
    .addAction(async (ctx, { flowDynamic }) => {
        // Solo activar si el usuario no está en espera
        if (!userStates.has(ctx.from)) {
            await flowDynamic([
                'Lo siento, no puedo procesar esa solicitud.',
                'Por favor, escribe HOLA para comenzar de nuevo.'
            ]);
        }
    });

// 7. INICIALIZACIÓN DEL BOT
const main = async () => {
    try {
        const adapterDB = new MockAdapter();
        const adapterFlow = createFlow([flowWelcome, flowServicios, flowResponseAfterQuote, flowCallback]);
        const adapterProvider = createProvider(BaileysProvider);
        // Creación del bot
        createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        });
        // Configuración del portal QR
        QRPortalWeb({
            port: 3004,
            publicSite: 'http://200.58.107.181',
            qrFile: 'bot',
        });
    } catch (error) {
        console.error('Error al iniciar el bot:', error);
    }
};

// 8. PUNTO FINAL: ARRANQUE DEL BOT
main();