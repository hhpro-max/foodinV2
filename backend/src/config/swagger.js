const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Foodin API',
      version: '1.0.0',
      description: 'API documentation for the Foodin application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            phone: {
              type: 'string',
              example: '+989123456789'
            },
            userType: {
              type: 'string',
              enum: ['natural', 'legal'],
              example: 'natural'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            isVerified: {
              type: 'boolean',
              example: true
            },
            profile: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                firstName: {
                  type: 'string',
                  example: 'John'
                },
                lastName: {
                  type: 'string',
                  example: 'Doe'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john.doe@example.com'
                },
                customerCode: {
                  type: 'string',
                  example: 'CUS123456789'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            price: {
              type: 'number',
              format: 'float',
            },
          },
        },
        CartItemRequest: {
          type: 'object',
          properties: {
            product_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              default: 1
            }
          },
          required: ['product_id']
        },
        CartItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            product_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              example: 'Organic Apples'
            },
            price: {
              type: 'number',
              format: 'float',
              example: 4.99
            },
            quantity: {
              type: 'integer',
              example: 2
            },
            total: {
              type: 'number',
              format: 'float',
              example: 9.98
            }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                buyer_id: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CartItem'
                  }
                },
                total: {
                  type: 'number',
                  format: 'float',
                  example: 19.95
                }
              }
            },
            message: {
              type: 'string',
              example: 'Item added to cart successfully'
            }
          }
        },
        DeliveryConfirmation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            buyerInvoiceId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            sellerInvoiceId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            deliveryCode: {
              type: 'string',
              example: '123456'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
              example: 'PENDING'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-08T13:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-08T13:00:00.000Z'
            }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            amount: {
              type: 'number',
              format: 'float',
              example: 49.99
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-15T00:00:00.000Z'
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'overdue'],
              example: 'pending'
            }
          },
          required: ['orderId', 'amount', 'dueDate']
        },
      },
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
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
