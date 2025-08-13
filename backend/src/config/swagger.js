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
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Home'
            },
            fullAddress: {
              type: 'string',
              minLength: 5,
              maxLength: 500,
              example: '123 Main St'
            },
            city: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Tehran'
            },
            postalCode: {
              type: 'string',
              pattern: '^\\d{10}$',
              example: '1234567890'
            },
            gps_latitude: {
              type: 'number',
              format: 'float',
              minimum: -90,
              maximum: 90,
              example: 35.6895
            },
            gps_longitude: {
              type: 'number',
              format: 'float',
              minimum: -180,
              maximum: 180,
              example: 51.3890
            },
            isPrimary: {
              type: 'boolean',
              example: false
            },
            isWarehouse: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              example: '2023-01-01T00:00:00.000Z'
            },
          },
          required: ['title', 'fullAddress', 'city'],
        },
        AddressInput: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Home'
            },
            full_address: {
              type: 'string',
              minLength: 5,
              maxLength: 500,
              example: '123 Main St'
            },
            city: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Tehran'
            },
            postal_code: {
              type: 'string',
              pattern: '^\\d{10}$',
              example: '1234567890'
            },
            gps_latitude: {
              type: 'number',
              format: 'float',
              minimum: -90,
              maximum: 90,
              example: 35.6895
            },
            gps_longitude: {
              type: 'number',
              format: 'float',
              minimum: -180,
              maximum: 180,
              example: 51.3890
            },
            is_primary: {
              type: 'boolean',
              example: false
            },
            is_warehouse: {
              type: 'boolean',
              example: false
            },
          },
          required: ['title', 'fullAddress', 'city'],
        },
        AddressUpdate: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Home'
            },
            fullAddress: {
              type: 'string',
              minLength: 5,
              maxLength: 500,
              example: '123 Main St'
            },
            city: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Tehran'
            },
            postalCode: {
              type: 'string',
              pattern: '^\\d{10}$',
              example: '1234567890'
            },
            gps_latitude: {
              type: 'number',
              format: 'float',
              minimum: -90,
              maximum: 90,
              example: 35.6895
            },
            gps_longitude: {
              type: 'number',
              format: 'float',
              minimum: -180,
              maximum: 180,
              example: 51.3890
            },
            isPrimary: {
              type: 'boolean',
              example: false
            },
            isWarehouse: {
              type: 'boolean',
              example: false
            },
          },
        },
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
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Fruits'
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: 'Fresh fruits from local farms'
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            isActive: {
              type: 'boolean',
              example: true
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
          },
          required: ['name']
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
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Home'
            },
            address_line: {
              type: 'string',
              minLength: 5,
              maxLength: 500,
              example: '123 Main St'
            },
            city: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Tehran'
            },
            postal_code: {
              type: 'string',
              pattern: '^\\d{10}$',
              example: '1234567890'
            },
            latitude: {
              type: 'number',
              format: 'float',
              minimum: -90,
              maximum: 90,
              example: 35.6895
            },
            longitude: {
              type: 'number',
              format: 'float',
              minimum: -180,
              maximum: 180,
              example: 51.3890
            },
            is_primary: {
              type: 'boolean',
              example: false
            },
            is_warehouse: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              example: '2023-01-01T00:00:00.000Z'
            },
          },
          required: ['title', 'address_line', 'city'],
        },
        DeliveryInformation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            buyerAddressId: {
              type: 'string',
              format: 'uuid',
            },
            sellerAddressId: {
              type: 'string',
              format: 'uuid',
            },
            deliveryDateRequested: {
              type: 'string',
              format: 'date-time',
            },
            buyerInvoiceId: {
              type: 'string',
              format: 'uuid',
            },
            sellerInvoiceId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
            },
          },
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
        ChooseRole: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['buyer', 'seller'],
              example: 'buyer'
            }
          },
          required: ['role']
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
