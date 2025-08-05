const ApiError = require('../utils/ApiError');

class AddressService {
  constructor({ addressRepo, userRepo }) {
    this.addressRepo = addressRepo;
    this.userRepo = userRepo;
  }

  async getUserAddresses(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const addresses = await this.addressRepo.findByUserId(userId);
    return addresses;
  }

  async getAddressById(addressId, userId) {
    const address = await this.addressRepo.findById(addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    // Verify ownership
    if (address.user_id !== userId) {
      throw ApiError.forbidden('You can only access your own addresses');
    }

    return address;
  }

  async createAddress(userId, addressData) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Validate coordinates if provided
    if (addressData.latitude && addressData.longitude) {
      this.validateCoordinates(addressData.latitude, addressData.longitude);
    }

    // If this is the user's first address, make it primary
    const existingAddresses = await this.addressRepo.findByUserId(userId);
    if (existingAddresses.length === 0) {
      addressData.is_primary = true;
    }

    const newAddress = await this.addressRepo.createWithFlags(userId, {
      user_id: userId,
      ...addressData,
    });

    return newAddress;
  }

  async updateAddress(addressId, userId, addressData) {
    const address = await this.addressRepo.findById(addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    // Verify ownership
    if (address.user_id !== userId) {
      throw ApiError.forbidden('You can only update your own addresses');
    }

    // Validate coordinates if provided
    if (addressData.latitude && addressData.longitude) {
      this.validateCoordinates(addressData.latitude, addressData.longitude);
    }

    const updatedAddress = await this.addressRepo.updateWithFlags(
      addressId,
      userId,
      addressData
    );

    if (!updatedAddress) {
      throw ApiError.notFound('Address not found or could not be updated');
    }

    return updatedAddress;
  }

  async deleteAddress(addressId, userId) {
    const address = await this.addressRepo.findById(addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    // Verify ownership
    if (address.user_id !== userId) {
      throw ApiError.forbidden('You can only delete your own addresses');
    }

    // Check if this is the only address
    const userAddresses = await this.addressRepo.findByUserId(userId);
    if (userAddresses.length === 1) {
      throw ApiError.badRequest('Cannot delete your only address');
    }

    const deletedAddress = await this.addressRepo.deleteUserAddress(addressId, userId);

    // If we deleted the primary address, set another one as primary
    if (address.is_primary) {
      const remainingAddresses = await this.addressRepo.findByUserId(userId);
      if (remainingAddresses.length > 0) {
        await this.addressRepo.setPrimaryAddress(userId, remainingAddresses[0].id);
      }
    }

    return deletedAddress;
  }

  async setPrimaryAddress(userId, addressId) {
    const address = await this.addressRepo.findById(addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    // Verify ownership
    if (address.user_id !== userId) {
      throw ApiError.forbidden('You can only modify your own addresses');
    }

    const updatedAddress = await this.addressRepo.setPrimaryAddress(userId, addressId);
    return updatedAddress;
  }

  async setWarehouseAddress(userId, addressId) {
    const address = await this.addressRepo.findById(addressId);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    // Verify ownership
    if (address.user_id !== userId) {
      throw ApiError.forbidden('You can only modify your own addresses');
    }

    // Verify user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updatedAddress = await this.addressRepo.setWarehouseAddress(userId, addressId);
    return updatedAddress;
  }

  async getPrimaryAddress(userId) {
    const address = await this.addressRepo.findPrimaryAddress(userId);
    return address;
  }

  async getWarehouseAddress(userId) {
    const address = await this.addressRepo.findWarehouseAddress(userId);
    return address;
  }

  async searchNearbyAddresses(latitude, longitude, radiusKm = 10, limit = 50) {
    this.validateCoordinates(latitude, longitude);
    
    const addresses = await this.addressRepo.searchNearbyAddresses(
      latitude,
      longitude,
      radiusKm,
      limit
    );
    
    return addresses;
  }

  validateCoordinates(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw ApiError.badRequest('Invalid coordinates format');
    }

    if (lat < -90 || lat > 90) {
      throw ApiError.badRequest('Latitude must be between -90 and 90');
    }

    if (lng < -180 || lng > 180) {
      throw ApiError.badRequest('Longitude must be between -180 and 180');
    }

    return { latitude: lat, longitude: lng };
  }

  async getAddressStats() {
    const stats = await this.addressRepo.getAddressStats();
    return stats;
  }

  // Geocoding helper (would integrate with a service like Google Maps API)
  async geocodeAddress(addressLine, city) {
    // In production, integrate with geocoding service
    // For now, return mock coordinates for Tehran
    return {
      latitude: 35.6892 + (Math.random() - 0.5) * 0.1,
      longitude: 51.3890 + (Math.random() - 0.5) * 0.1,
    };
  }

  // Reverse geocoding helper
  async reverseGeocode(latitude, longitude) {
    // In production, integrate with reverse geocoding service
    return {
      address_line: 'Sample Address',
      city: 'Tehran',
      postal_code: '1234567890',
    };
  }
}

module.exports = AddressService;