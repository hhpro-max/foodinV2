const request = require('supertest');
const app = require('../../src/app');
const {
  createTestUser,
  createTestProduct,
  getAuthHeader,
} = require('../utils/testUtils');
require('../utils/setup');

describe('Product Routes', () => {
  let adminUser, sellerUser, buyerUser;
  let adminAuthHeader, sellerAuthHeader, buyerAuthHeader;

  beforeAll(async () => {
    adminUser = await createTestUser('admin');
    sellerUser = await createTestUser('seller');
    buyerUser = await createTestUser('buyer');

    adminAuthHeader = getAuthHeader(adminUser.token);
    sellerAuthHeader = getAuthHeader(sellerUser.token);
    buyerAuthHeader = getAuthHeader(buyerUser.token);
  });

  describe('POST /products', () => {
    it('should allow a seller to create a product, which should be in "pending" status', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A product for testing.',
        purchase_price: 100,
        stock_quantity: 10,
      };

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', sellerAuthHeader)
        .send(productData)
        .expect(201);

      expect(res.body.data.product).toHaveProperty('id');
      expect(res.body.data.product.status).toBe('pending');
      expect(res.body.data.product.name).toBe(productData.name);
    });
  });

  describe('Product Approval Workflow', () => {
    let pendingProduct;

    beforeAll(async () => {
      pendingProduct = await createTestProduct(sellerUser.id, {
        name: 'Pending Approval Product',
        purchase_price: 150,
      });
    });

    it('should not be visible to a buyer before approval', async () => {
      await request(app)
        .get(`/api/v1/products/${pendingProduct.id}`)
        .set('Authorization', buyerAuthHeader)
        .expect(404);
    });

    it('should be visible to the seller who created it', async () => {
      const res = await request(app)
        .get(`/api/v1/products/${pendingProduct.id}`)
        .set('Authorization', sellerAuthHeader)
        .expect(200);
      expect(res.body.data.product.id).toBe(pendingProduct.id);
    });

    it('should be visible to an admin', async () => {
      const res = await request(app)
        .get(`/api/v1/products/${pendingProduct.id}`)
        .set('Authorization', adminAuthHeader)
        .expect(200);
      expect(res.body.data.product.id).toBe(pendingProduct.id);
    });

    it('should allow an admin to approve the product', async () => {
      const approvalData = {
        sale_price: 200,
        notes: 'Approved for sale.',
      };

      const res = await request(app)
        .post(`/api/v1/products/${pendingProduct.id}/approve`)
        .set('Authorization', adminAuthHeader)
        .send(approvalData)
        .expect(200);

      expect(res.body.data.product.status).toBe('approved');
      expect(res.body.data.product.salePrice).toBe(approvalData.sale_price);
    });

    it('should be visible to a buyer after approval', async () => {
      const res = await request(app)
        .get(`/api/v1/products/${pendingProduct.id}`)
        .set('Authorization', buyerAuthHeader)
        .expect(200);
      expect(res.body.data.product.id).toBe(pendingProduct.id);
    });
  });

  describe('Product Rejection Workflow', () => {
    let pendingProduct;

    beforeAll(async () => {
      pendingProduct = await createTestProduct(sellerUser.id, {
        name: 'Pending Rejection Product',
        purchase_price: 180,
      });
    });

    it('should allow an admin to reject the product', async () => {
      const rejectionData = {
        notes: 'Product does not meet quality standards.',
      };

      const res = await request(app)
        .post(`/api/v1/products/${pendingProduct.id}/reject`)
        .set('Authorization', adminAuthHeader)
        .send(rejectionData)
        .expect(200);

      expect(res.body.data.product.status).toBe('rejected');
    });

    it('should not be visible to a buyer after rejection', async () => {
      await request(app)
        .get(`/api/v1/products/${pendingProduct.id}`)
        .set('Authorization', buyerAuthHeader)
        .expect(404);
    });
  });
});