const ApiError = require('../utils/ApiError');
const path = require('path');
const fs = require('fs').promises;

class ImageService {
  constructor({ imageRepository }) {
    this.imageRepository = imageRepository;
  }

  async saveProductImages(productId, imageFiles) {
    if (!imageFiles || imageFiles.length === 0) {
      return [];
    }

    const uploadDir = path.join(__dirname, '../../uploads/products');
    const savedImages = [];

    try {
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        
        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const filename = `${productId}_${Date.now()}_${i}${fileExtension}`;
        const filepath = path.join(uploadDir, filename);
        
        // Save the file to disk
        await fs.writeFile(filepath, file.buffer);
        
        // Create image URL with API path to avoid CORS issues
        const imageUrl = `/api/v1/images/products/${filename}`;
        
        // Save image record to database
        const imageRecord = await this.imageRepository.create({
          productId: productId,
          url: imageUrl,
          displayOrder: i,
          isPrimary: i === 0 // First image is primary
        });
        
        savedImages.push(imageRecord);
      }

      return savedImages;
    } catch (error) {
      // If there's an error, clean up any saved files
      await this.cleanupFailedUploads(productId, savedImages.length);
      throw error;
    }
  }

  async getProductImages(productId) {
    return await this.imageRepository.getImagesByProductId(productId);
  }

  async getPrimaryProductImage(productId) {
    return await this.imageRepository.getPrimaryImage(productId);
  }

  async updateImageDisplayOrder(imageId, newOrder) {
    return await this.imageRepository.updateImageDisplayOrder(imageId, newOrder);
  }

  async deleteProductImage(imageId) {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw ApiError.notFound('Image not found');
    }

    // Delete the file from disk
    try {
      // Extract filename from the API URL
      const filename = image.url.split('/').pop();
      const filepath = path.join(__dirname, '../../uploads/products', filename);
      await fs.unlink(filepath);
    } catch (error) {
      // File might not exist, but we still want to delete the DB record
      console.warn('Could not delete image file:', error.message);
    }

    // Delete the record from database
    return await this.imageRepository.deleteImage(imageId);
  }

  async deleteProductImages(productId) {
    const images = await this.imageRepository.getImagesByProductId(productId);
    
    // Delete all files from disk
    for (const image of images) {
      try {
        // Extract filename from the API URL
        const filename = image.url.split('/').pop();
        const filepath = path.join(__dirname, '../../uploads/products', filename);
        await fs.unlink(filepath);
      } catch (error) {
        console.warn('Could not delete image file:', error.message);
      }
    }

    // Delete all records from database
    return await this.imageRepository.deleteImagesByProductId(productId);
  }

  async cleanupFailedUploads(productId, successfulCount) {
    try {
      const uploadDir = path.join(__dirname, '../../uploads/products');
      const files = await fs.readdir(uploadDir);
      
      // Delete files that match the pattern for this product but weren't successfully saved
      for (const file of files) {
        if (file.startsWith(`${productId}_`) && file.includes('_')) {
          const fileIndex = parseInt(file.split('_')[2].split('.')[0]);
          if (fileIndex >= successfulCount) {
            await fs.unlink(path.join(uploadDir, file));
          }
        }
      }
    } catch (error) {
      console.warn('Cleanup failed:', error.message);
    }
  }
}

module.exports = ImageService;