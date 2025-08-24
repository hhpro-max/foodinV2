const InvoiceService = require('../services/invoice.service');

class InvoiceController {
  constructor(sequelize) {
    this.invoiceService = new InvoiceService(sequelize);
  }

  async createInvoice(req, res, next) {
    try {
      const { buyerId, items } = req.body;
      const invoice = await this.invoiceService.createInvoice(buyerId, items);
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async markInvoiceAsPaid(req, res, next) {
    try {
      const { invoiceId } = req.params;
      const updatedInvoice = await this.invoiceService.markInvoiceAsPaid(invoiceId);
      res.status(200).json(updatedInvoice);
    } catch (error) {
      next(error);
    }
  }
  async getInvoicesByOrderId(req, res, next) {
    try {
      const { orderId } = req.params;
      const invoices = await this.invoiceService.getInvoicesByOrderId(orderId);
      res.status(200).json(invoices);
    } catch (error) {
      next(error);
    }
  }
  async getInvoicesByBuyer(req, res, next) {
    try {
      const { id: buyerId } = req.user;
      const invoices = await this.invoiceService.getInvoicesByBuyer(buyerId);
      res.status(200).json(invoices);
    } catch (error) {
      next(error);
    }
  }

  async getMyInvoices(req, res, next) {
    try {
      const { id: userId, roles } = req.user;
      const invoices = await this.invoiceService.getMyInvoices(userId, roles);
      res.status(200).json(invoices);
    } catch (error) {
      next(error);
    }
  }

  async getAllInvoices(req, res, next) {
    try {
      const invoices = await this.invoiceService.getAllInvoices();
      res.status(200).json(invoices);
    } catch (error) {
      next(error);
    }
  }

  async generateInvoicePDF(req, res, next) {
    try {
      const { invoiceId } = req.params;
      
      // Check if PDF already exists
      let filePath = this.invoiceService.getInvoicePDFPath(invoiceId);
      
      // If PDF doesn't exist, generate it
      if (!filePath) {
        filePath = await this.invoiceService.generateInvoicePDF(invoiceId);
      }
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
      
      // Send the PDF file
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InvoiceController;
