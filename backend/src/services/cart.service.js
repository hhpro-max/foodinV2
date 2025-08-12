const ApiError = require('../utils/ApiError');

class CartService {
  constructor({ cartRepo, productRepo, userRepo }) {
    this.cartRepo = cartRepo;
    this.productRepo = productRepo;
    this.userRepo = userRepo;
  }

  async getCart(buyerId) {
    const cart = await this.cartRepo.findOrCreateCart(buyerId);
    
    // Validate cart items and remove invalid ones
    await this.validateAndCleanCart(cart.id);
    
    // Get updated cart with items and summary
    const updatedCart = await this.cartRepo.findByBuyer(buyerId);
    
    const summary = await this.cartRepo.getCartSummary(cart.id);
    
    if (!updatedCart) {
      return {
        id: cart.id,
        buyerId,
        items: [],
        summary
      };
    }
    
    // Convert Sequelize model to JSON and add items array
    const cartData = updatedCart.toJSON();
    
    // Ensure items are properly mapped
    const response = {
      id: cartData.id,
      buyerId: cartData.buyerId,
      createdAt: cartData.createdAt,
      updatedAt: cartData.updatedAt,
      items: cartData.items ? cartData.items.map(item => {
        // Handle cases where product might be null
        const product = item.product || {};
        return {
          id: item.id,
          product_id: item.productId,
          name: product.name || null,
          price: item.unitPrice,
          quantity: item.quantity,
          total: item.quantity * item.unitPrice
        };
      }) : [],
      summary
    };
    
    return response;
  }

  async addToCart(buyerId, productId, quantity = 1) {
    // Validate product - only retrieve approved and active products
    const products = await this.productRepo.findApproved({ id: productId });
    if (!products || products.length === 0) {
      throw ApiError.notFound('Product not found or not available for purchase');
    }
    const product = products[0];

    if (!product.salePrice) {
      throw ApiError.badRequest('Product price not set');
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      throw ApiError.badRequest(`Only ${product.stockQuantity} items available in stock`);
    }

    // Check minimum order quantity
    if (quantity < product.minOrderQuantity) {
      throw ApiError.badRequest(`Minimum order quantity is ${product.minOrderQuantity}`);
    }

    // Get or create cart
    const cart = await this.cartRepo.findOrCreateCart(buyerId);

    // Add item to cart
    await this.cartRepo.addItem(cart.id, productId, quantity, product.salePrice);

    return await this.getCart(buyerId);
  }

  async updateCartItem(buyerId, productId, quantity) {
    const cart = await this.cartRepo.findByBuyer(buyerId);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    // Validate product and quantity
    if (quantity > 0) {
      const products = await this.productRepo.findApproved({ id: productId });
      if (!products || products.length === 0) {
        throw ApiError.notFound('Product not found or not available for purchase');
      }
      const product = products[0];

      if (product.stockQuantity < quantity) {
        throw ApiError.badRequest(`Only ${product.stockQuantity} items available in stock`);
      }

      if (quantity < product.minOrderQuantity) {
        throw ApiError.badRequest(`Minimum order quantity is ${product.minOrderQuantity}`);
      }
    }

    // Update item quantity
    await this.cartRepo.updateItemQuantity(cart.id, productId, quantity);

    return await this.getCart(buyerId);
  }

  async removeFromCart(buyerId, productId) {
    const cart = await this.cartRepo.findByBuyer(buyerId);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    await this.cartRepo.removeItem(cart.id, productId);

    return await this.getCart(buyerId);
  }

  async clearCart(buyerId) {
    const cart = await this.cartRepo.findByBuyer(buyerId);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    await this.cartRepo.clearCart(cart.id);

    return { message: 'Cart cleared successfully' };
  }

  async getCartItemsBySeller(buyerId) {
    const cart = await this.cartRepo.findByBuyer(buyerId);
    if (!cart) {
      return [];
    }

    // Validate and clean cart first
    await this.validateAndCleanCart(cart.id);

    const itemsBySeller = await this.cartRepo.getCartItemsBySeller(cart.id);
    
    return itemsBySeller;
  }

  async validateAndCleanCart(cartId) {
    // Remove invalid items (inactive or unapproved products)
    const removedItems = (await this.cartRepo.removeInvalidItems(cartId)) || [];
    
    // Update prices for items where price has changed
    const updatedPrices = (await this.cartRepo.updatePrices(cartId)) || [];
    
    // Validate remaining items
    const validationResults = (await this.cartRepo.validateCartItems(cartId)) || [];
    
    const issues = [];
    
    if (removedItems.length > 0) {
      issues.push({
        type: 'items_removed',
        message: `${removedItems.length} unavailable items were removed from your cart`,
        items: removedItems,
      });
    }
    
    if (updatedPrices.length > 0) {
      issues.push({
        type: 'prices_updated',
        message: `Prices were updated for ${updatedPrices.length} items`,
        items: updatedPrices,
      });
    }
    
    const stockIssues = validationResults.filter(item => item.validation_status === 'insufficient_stock');
    if (stockIssues.length > 0) {
      issues.push({
        type: 'stock_issues',
        message: 'Some items have insufficient stock',
        items: stockIssues,
      });
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }

  async validateCart(buyerId) {
    const cart = await this.cartRepo.findByBuyer(buyerId);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }
    
    const validation = await this.validateAndCleanCart(cart.id);
    
    return {
      valid: validation.valid,
      issues: validation.issues,
    };
  }

  async getCartSummary(buyerId) {
    const cart = await this.cartRepo.findByBuyer(buyerId);
    if (!cart) {
      return {
        total_items: 0,
        total_quantity: 0,
        total_amount: 0,
        seller_count: 0,
      };
    }
    
    const summary = await this.cartRepo.getCartSummary(cart.id);
    return summary;
  }

  async prepareCheckout(buyerId, addressId = null) {
    const cart = await this.cartRepo.findByBuyer(buyerId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // Validate and clean cart
    const validation = await this.validateAndCleanCart(cart.id);
    if (!validation.valid) {
      const stockIssues = validation.issues.find(issue => issue.type === 'stock_issues');
      if (stockIssues) {
        throw ApiError.badRequest('Some items in your cart have insufficient stock. Please update quantities.');
      }
    }

    // Get items grouped by seller
    const itemsBySeller = await this.cartRepo.getCartItemsBySeller(cart.id);
    
    // Get buyer's address if specified
    let deliveryAddress = null;
    if (addressId) {
      const addressRepo = this.addressRepo || this.cartRepo; // Fallback if addressRepo not injected
      if (addressRepo.findById) {
        deliveryAddress = await addressRepo.findById(addressId);
        if (!deliveryAddress || deliveryAddress.user_id !== buyerId) {
          throw ApiError.badRequest('Invalid delivery address');
        }
      }
    }

    // Calculate totals
    let grandTotal = 0;
    const sellerInvoices = itemsBySeller.map(seller => {
      const sellerTotal = parseFloat(seller.seller_total);
      grandTotal += sellerTotal;
      
      return {
        seller_id: seller.seller_id,
        seller_name: seller.seller_name,
        seller_phone: seller.seller_phone,
        items: seller.items,
        subtotal: sellerTotal,
        tax_amount: 0, // Can be calculated based on business rules
        total_amount: sellerTotal,
      };
    });

    return {
      buyer_id: buyerId,
      delivery_address: deliveryAddress,
      seller_invoices: sellerInvoices,
      grand_total: grandTotal,
      validation_issues: validation.issues,
    };
  }

  async getCartStats() {
    const stats = await this.cartRepo.getCartStats();
    return stats;
  }

  async getAbandonedCarts(daysOld = 7, limit = 100) {
    const carts = await this.cartRepo.getAbandonedCarts(daysOld, limit);
    return carts;
  }

  // Helper method to calculate cart totals
  calculateCartTotals(items) {
    let subtotal = 0;
    let totalItems = 0;
    let totalQuantity = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      totalItems += 1;
      totalQuantity += item.quantity;
    });

    return {
      total_items: totalItems,
      total_quantity: totalQuantity,
      subtotal,
      tax_amount: 0, // Can be calculated based on business rules
      discount_amount: 0, // Can be applied based on promo codes
      total_amount: subtotal,
    };
  }

  // Helper method to group items by seller
  groupItemsBySeller(items) {
    const sellerGroups = {};

    items.forEach(item => {
      const sellerId = item.seller_id;
      
      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          seller_id: sellerId,
          seller_name: item.seller_name,
          items: [],
          subtotal: 0,
        };
      }

      sellerGroups[sellerId].items.push(item);
      sellerGroups[sellerId].subtotal += item.quantity * item.unit_price;
    });

    return Object.values(sellerGroups);
  }
}

module.exports = CartService;