const InvoiceRepository = require('../repositories/invoice.repository');
const InvoiceItemRepository = require('../repositories/invoice_item.repository');
const PDFService = require('./pdf.service');
const UserRepository = require('../repositories/user.repository');
const ProfileRepository = require('../repositories/profile.repository');
const AddressRepository = require('../repositories/address.repository');
const ProductRepository = require('../repositories/product.repository');

class InvoiceService {
  constructor(sequelize) {
    this.invoiceRepository = new InvoiceRepository(sequelize);
    this.invoiceItemRepository = new InvoiceItemRepository(sequelize);
    this.userRepository = new UserRepository(sequelize);
    this.profileRepository = new ProfileRepository(sequelize);
    this.addressRepository = new AddressRepository(sequelize);
    this.productRepository = new ProductRepository(sequelize);
    this.pdfService = new PDFService();
  }

  async createInvoice(buyerId, sellerId, orderId, items, transaction = null) {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const invoice = await this.invoiceRepository.create({
      buyerId,
      sellerId,
      orderId,
      totalAmount,
      status: 'pending',
    }, { transaction });

    for (const item of items) {
      await this.invoiceItemRepository.create({
        invoiceId: invoice.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      }, { transaction });
    }

    return invoice;
  }

  async markInvoiceAsPaid(invoiceId) {
    return this.invoiceRepository.update(invoiceId, { status: 'paid' });
  }
  async getInvoicesByOrderId(orderId) {
    return this.invoiceRepository.findByOrderId(orderId);
  }

  async getInvoicesByBuyer(buyerId) {
    return this.invoiceRepository.findByBuyer(buyerId);
  }

  async getMyInvoices(userId, roles) {
    const isSeller = roles.some(role => role.name === 'seller');
    const invoices = await this.invoiceRepository.findByUser(userId, isSeller);
    
    return invoices.map(invoice => {
      const plainInvoice = invoice.get({ plain: true });
      
      if (!isSeller) {
        // For buyers, include delivery code if available
        const deliveryConfirmation = invoice.DeliveryConfirmationForBuyer;
        if (deliveryConfirmation) {
          plainInvoice.deliveryCode = deliveryConfirmation.deliveryCode;
        }
      }
      
      return plainInvoice;
    });
  }

  async getAllInvoices() {
    return this.invoiceRepository.getAllInvoices();
  }

  /**
   * Generate a PDF invoice
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<string>} - Path to the generated PDF file
   */
  async generateInvoicePDF(invoiceId) {
    // Get invoice with details
    const invoice = await this.invoiceRepository.findByIdWithDetails(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Get buyer's primary address
    const buyerAddresses = await this.addressRepository.findByUserId(invoice.buyerId);
    const primaryAddress = buyerAddresses.find(addr => addr.isPrimary) || buyerAddresses[0];

    // Format the data for the PDF
    const invoiceData = {
      invoiceNumber: this.pdfService._getNextInvoiceNumber(), // Use sequential invoice number
      invoiceDate: new Date(invoice.createdAt).toLocaleDateString('fa-IR'),
      poNumber: 'N/A', // PO number not implemented yet
      seller: {
        name: `${invoice.seller.profile?.firstName || ''} ${invoice.seller.profile?.lastName || ''}`.trim() || 'Unknown Seller',
        address: '123 Seller Street, Tehran, Iran', // Placeholder address
        phone: invoice.seller.phone || 'N/A',
        email: invoice.seller.profile?.email || 'N/A'
      },
      buyer: {
        name: `${invoice.buyer.profile?.firstName || ''} ${invoice.buyer.profile?.lastName || ''}`.trim() || 'Unknown Buyer',
        address: primaryAddress ? `${primaryAddress.fullAddress}, ${primaryAddress.city}` : 'No address provided',
        phone: invoice.buyer.phone || 'N/A',
        email: invoice.buyer.profile?.email || 'N/A'
      },
      items: invoice.invoiceItems.map(item => ({
        description: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice
      })),
      subtotal: invoice.totalAmount,
      total: invoice.totalAmount,
      currency: 'ریال', // Rial for Iran
      paymentMethod: 'پرداخت در محل' // Cash on delivery
    };

    // Generate the PDF
    return await this.pdfService.generateInvoicePDF(invoiceData);
  }

  /**
   * Get the file path for an invoice PDF
   * @param {string} invoiceId - The invoice ID
   * @returns {string} - Path to the PDF file
   */
  getInvoicePDFPath(invoiceId) {
    return this.pdfService.getInvoicePDFPath(invoiceId);
  }
}

module.exports = InvoiceService;
