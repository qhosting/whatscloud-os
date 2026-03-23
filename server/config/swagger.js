import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsCloud OS API',
      version: '1.0.0',
      description: 'API documentation for WhatsCloud OS Scraping and SaaS platform',
      contact: {
        name: 'Technical Support',
        url: 'https://whatscloud.io',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.whatscloud.io',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/app.js', './server/controllers/*.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
