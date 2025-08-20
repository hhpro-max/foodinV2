const catchAsync = require('../utils/catchAsync');
const path = require('path');
const fs = require('fs').promises;

// Serve product image by filename
const serveProductImage = catchAsync(async (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent directory traversal attacks
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid filename'
    });
  }
  
  const imagePath = path.join(__dirname, '../../uploads/products', filename);
  
  try {
    // Check if file exists
    await fs.access(imagePath);
    
    // Set appropriate content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    const contentType = mimeTypes[ext] || 'image/jpeg';
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    
    // Serve the file
    res.sendFile(imagePath);
  } catch (error) {
    // File not found or other error
    res.status(404).json({
      status: 'error',
      message: 'Image not found'
    });
  }
});

module.exports = {
  serveProductImage
};