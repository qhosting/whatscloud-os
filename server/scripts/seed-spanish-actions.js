import '../config/env.js';
import { AIPersona, Organization } from '../models/index.js';

const seedSpanishActions = async () => {
    try {
        console.log('--- STARTING SPANISH SMART ACTIONS SEEDING ---');
        
        const personas = await AIPersona.findAll();
        
        const examples = [
            {
                id: 'ACT_MENU_PROD',
                name: 'Ver Catálogo de Productos',
                type: 'button',
                triggerCode: '{{ACTION_PRODUCTOS}}',
                content: {
                    text: '¡Claro! Aquí tienes nuestras opciones principales. ¿Cuál te interesa?',
                    buttons: ['Ofertas del Mes', 'Nuevos Arribos', 'Más Vendidos']
                }
            },
            {
                id: 'ACT_UBICACION',
                name: 'Enviar Ubicación (Mapa)',
                type: 'image',
                triggerCode: '{{ACTION_MAPA}}',
                content: {
                    url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&q=80&w=800',
                    text: 'Te esperamos en nuestra sucursal central. ¡Aquí tienes el mapa!'
                }
            },
            {
                id: 'ACT_SOPORTE_LISTA',
                name: 'Menú de Soporte Técnico',
                type: 'list',
                triggerCode: '{{ACTION_SOPORTE}}',
                content: {
                    text: '¿En qué área necesitas ayuda hoy?',
                    listTitle: 'Opciones de Soporte',
                    listRows: ['Falla de Conexión', 'Duda de Facturación', 'Configuración Inicial', 'Hablar con Humano']
                }
            },
            {
                id: 'ACT_CAPTURA_DATOS',
                name: 'Capturar Datos de Pedido',
                type: 'input',
                triggerCode: '{{ACTION_DATOS}}',
                content: {
                    text: 'Para procesar tu envío, necesito un par de datos.',
                    inputPlaceholder: 'Escribe tu dirección de entrega aquí...'
                }
            }
        ];

        for (const persona of personas) {
            console.log(`Updating Persona: ${persona.name} (Org: ${persona.organizationId})`);
            
            // Solo agregar si no tiene acciones o si queremos forzar ejemplos en español
            const currentActions = persona.actions || [];
            
            // Evitar duplicados por triggerCode
            const existingCodes = new Set(currentActions.map(a => a.triggerCode));
            const newActions = [...currentActions];
            
            examples.forEach(ex => {
                if (!existingCodes.has(ex.triggerCode)) {
                    newActions.push(ex);
                }
            });

            await persona.update({ actions: newActions });
        }

        console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('SEEDING ERROR:', error);
        process.exit(1);
    }
};

seedSpanishActions();
