const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getUserAddresses = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const addresses = await req.container.addressService.getUserAddresses(userId);
  
  res.status(200).json({
    status: 'success',
    data: { addresses },
  });
});

const getAddressById = catchAsync(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  
  const address = await req.container.addressService.getAddressById(addressId, userId);
  
  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

const createAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const addressData = req.body;
  
  const address = await req.container.addressService.createAddress(userId, addressData);
  
  res.status(201).json({
    status: 'success',
    data: { address },
  });
});

const updateAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  const addressData = req.body;
  
  const address = await req.container.addressService.updateAddress(
    addressId,
    userId,
    addressData
  );
  
  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

const deleteAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  
  await req.container.addressService.deleteAddress(addressId, userId);
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const setPrimaryAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  
  const address = await req.container.addressService.setPrimaryAddress(userId, addressId);
  
  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

const setWarehouseAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  
  const address = await req.container.addressService.setWarehouseAddress(userId, addressId);
  
  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

const getPrimaryAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const address = await req.container.addressService.getPrimaryAddress(userId);
  
  if (!address) {
    throw ApiError.notFound('No primary address found');
  }
  
  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

const getWarehouseAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const address = await req.container.addressService.getWarehouseAddress(userId);
  
  if (!address) {
    throw ApiError.notFound('No warehouse address found');
  }
  
  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

const searchNearbyAddresses = catchAsync(async (req, res) => {
  const { latitude, longitude, radius = 10, limit = 50 } = req.query;
  
  if (!latitude || !longitude) {
    throw ApiError.badRequest('Latitude and longitude are required');
  }
  
  const addresses = await req.container.addressService.searchNearbyAddresses(
    parseFloat(latitude),
    parseFloat(longitude),
    parseInt(radius),
    parseInt(limit)
  );
  
  res.status(200).json({
    status: 'success',
    data: { addresses },
  });
});

const geocodeAddress = catchAsync(async (req, res) => {
  const { address_line, city } = req.body;
  
  if (!address_line || !city) {
    throw ApiError.badRequest('Address line and city are required');
  }
  
  const coordinates = await req.container.addressService.geocodeAddress(address_line, city);
  
  res.status(200).json({
    status: 'success',
    data: { coordinates },
  });
});

const reverseGeocode = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    throw ApiError.badRequest('Latitude and longitude are required');
  }
  
  const addressInfo = await req.container.addressService.reverseGeocode(
    parseFloat(latitude),
    parseFloat(longitude)
  );
  
  res.status(200).json({
    status: 'success',
    data: { address: addressInfo },
  });
});

const getAddressStats = catchAsync(async (req, res) => {
  const stats = await req.container.addressService.getAddressStats();
  
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

module.exports = {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
  setWarehouseAddress,
  getPrimaryAddress,
  getWarehouseAddress,
  searchNearbyAddresses,
  geocodeAddress,
  reverseGeocode,
  getAddressStats,
};