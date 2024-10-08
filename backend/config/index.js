const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'motorq',
      version: '1.0.0',
      description: 'motorq API',
      license: {
        name: 'MIT',
        url: 'https://choosealicense.com/licenses/mit/',
      },
    },
    basePath: '/api',
    servers: [
      {
        url: 'http://localhost:3000/api/',
      },
    ],
  },
  tags: [
    {
      "name": "User",
      "description": "API for users"
    }
  ],
  apis: [
    "src/models/*.js",
    "src/api/controllers/*.js",
  ]
};

module.exports = {
  swaggerOptions
};