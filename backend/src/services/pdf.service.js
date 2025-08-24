const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  constructor() {
    // Create uploads directory if it doesn't exist
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.invoicesDir = path.join(this.uploadsDir, 'invoices');
    
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
    
    // Initialize invoice counter file
    this.counterFile = path.join(this.invoicesDir, 'invoice_counter.txt');
    if (!fs.existsSync(this.counterFile)) {
      fs.writeFileSync(this.counterFile, '1000'); // Start from 1000
    }
    
    // Check for logo file
    this.logoPath = path.join(this.uploadsDir, 'logo.png');
    if (!fs.existsSync(this.logoPath)) {
      // Create a simple placeholder logo if it doesn't exist
      this._createPlaceholderLogo();
    }
  }

  /**
   * Get the next sequential invoice number
   * @returns {number} - The next invoice number
   */
  _getNextInvoiceNumber() {
    const currentNumber = parseInt(fs.readFileSync(this.counterFile, 'utf8'));
    const nextNumber = currentNumber + 1;
    fs.writeFileSync(this.counterFile, nextNumber.toString());
    return nextNumber;
  }

  /**
   * Create a placeholder logo
   * @private
   */
  _createPlaceholderLogo() {
    // For now, we'll just create an empty file
    // In a real implementation, you would either:
    // 1. Use an existing logo file
    // 2. Generate a simple logo programmatically
    // 3. Download a logo from a URL
    fs.writeFileSync(this.logoPath, '');
  }

  /**
   * Get the file path for an invoice PDF
   * @param {string} invoiceId - The invoice ID
   * @returns {string} - Path to the PDF file
   */
  getInvoicePDFPath(invoiceId) {
    // Find the most recent PDF file for this invoice
    const files = fs.readdirSync(this.invoicesDir);
    const invoiceFiles = files.filter(file =>
      file.startsWith(`invoice-${invoiceId}`) && file.endsWith('.pdf')
    );
    
    if (invoiceFiles.length === 0) {
      return null;
    }
    
    // Return the most recent file (they have timestamps in the name)
    invoiceFiles.sort((a, b) => {
      const aTimestamp = parseInt(a.split('-').pop().replace('.pdf', ''));
      const bTimestamp = parseInt(b.split('-').pop().replace('.pdf', ''));
      return bTimestamp - aTimestamp;
    });
    
    return path.join(this.invoicesDir, invoiceFiles[0]);
  }

  /**
   * Generate an invoice PDF
   * @param {Object} invoiceData - The invoice data
   * @returns {Promise<string>} - Path to the generated PDF file
   */
  async generateInvoicePDF(invoiceData) {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Generate a unique filename
    const filename = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`;
    const filePath = path.join(this.invoicesDir, filename);

    // Create write stream
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Generate the PDF content
    await this._buildInvoiceContent(doc, invoiceData);

    // Finalize the PDF and end the stream
    doc.end();

    // Wait for the file to be written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        resolve(filePath);
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Build the invoice content
   * @param {PDFDocument} doc - The PDF document
   * @param {Object} data - The invoice data
   */
  async _buildInvoiceContent(doc, data) {
    const {
      invoiceNumber,
      invoiceDate,
      poNumber,
      seller,
      buyer,
      items,
      subtotal,
      total,
      currency,
      paymentMethod
    } = data;

    // Set font sizes
    const headingSize = 15;
    const subHeadingSize = 12;
    const normalSize = 10;
    const smallSize = 8;

    // Add company logo (placeholder)
    this._addLogo(doc, 50, 45, 100);

    // Invoice title
    doc.fontSize(headingSize).text('INVOICE', 400, 50);
    
    // Invoice metadata
    doc.fontSize(normalSize)
       .text(`Invoice Number: ${invoiceNumber}`, 400, 80)
       .text(`Invoice Date: ${invoiceDate}`, 400, 95)
       .text(`PO Number: ${poNumber || 'N/A'}`, 400, 110);

    // Seller information
    doc.fontSize(subHeadingSize).text('Seller:', 50, 150);
    doc.fontSize(normalSize)
       .text(seller.name, 50, 170)
       .text(seller.address, 50, 185)
       .text(`Phone: ${seller.phone || 'N/A'}`, 50, 200)
       .text(`Email: ${seller.email || 'N/A'}`, 50, 215);

    // Buyer information
    doc.fontSize(subHeadingSize).text('Buyer:', 300, 150);
    doc.fontSize(normalSize)
       .text(buyer.name, 300, 170)
       .text(buyer.address, 300, 185)
       .text(`Phone: ${buyer.phone || 'N/A'}`, 300, 200)
       .text(`Email: ${buyer.email || 'N/A'}`, 300, 215);

    // Itemized list header
    const tableTop = 250;
    const rowHeight = 20;
    
    doc.fontSize(subHeadingSize).text('Description', 50, tableTop)
       .text('Quantity', 250, tableTop)
       .text('Unit Price', 350, tableTop)
       .text('Total', 450, tableTop);

    // Draw a line under the header
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    // Itemized list
    let yPosition = tableTop + 30;
    items.forEach(item => {
      doc.fontSize(normalSize)
         .text(item.description, 50, yPosition)
         .text(item.quantity.toString(), 250, yPosition)
         .text(`${item.unitPrice.toFixed(2)} ${currency}`, 350, yPosition)
         .text(`${item.total.toFixed(2)} ${currency}`, 450, yPosition);
      
      yPosition += rowHeight;
    });

    // Draw a line before totals
    doc.moveTo(300, yPosition + 5)
       .lineTo(550, yPosition + 5)
       .stroke();

    // Financial details
    yPosition += 20;
    doc.fontSize(normalSize)
       .text('Subtotal:', 350, yPosition)
       .text(`${subtotal.toFixed(2)} ${currency}`, 450, yPosition);
    
    yPosition += 20;
    doc.fontSize(subHeadingSize)
       .text('Total:', 350, yPosition)
       .text(`${total.toFixed(2)} ${currency}`, 450, yPosition);

    // Payment information
    yPosition += 40;
    doc.fontSize(subHeadingSize).text('Payment Information:', 50, yPosition);
    yPosition += 20;
    doc.fontSize(normalSize)
       .text(`Payment Method: ${paymentMethod}`, 50, yPosition);

    // Signature placeholder
    yPosition += 40;
    doc.fontSize(subHeadingSize).text('Signature:', 50, yPosition);
    doc.rect(150, yPosition - 5, 200, 40).stroke();
  }

  /**
   * Add a logo to the PDF (placeholder)
   * @param {PDFDocument} doc - The PDF document
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of the logo
   */
  _addLogo(doc, x, y, width) {
    try {
      // Check if logo file exists and is not empty
      if (fs.existsSync(this.logoPath) && fs.statSync(this.logoPath).size > 0) {
        // Embed the logo image
        doc.image(this.logoPath, x, y, { width: width, height: 50 });
      } else {
        // Fallback to placeholder if logo doesn't exist or is empty
        doc.rect(x, y, width, 50).stroke();
        doc.fontSize(10).text('LOGO', x + width/2 - 15, y + 20);
      }
    } catch (error) {
      // Fallback to placeholder if there's an error loading the image
      doc.rect(x, y, width, 50).stroke();
      doc.fontSize(10).text('LOGO', x + width/2 - 15, y + 20);
    }
  }
}

module.exports = PDFService;

module.exports = PDFService;