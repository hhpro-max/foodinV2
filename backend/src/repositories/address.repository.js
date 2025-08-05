const BaseRepository = require('./base.repository');
const { Address } = require('../models');
const { Op } = require('sequelize');

class AddressRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Address);
  }

  async findByUserId(userId) {
    return await this.findAll({ userId }, [['isPrimary', 'DESC'], ['createdAt', 'DESC']]);
  }

  async findPrimaryAddress(userId) {
    return await this.findOne({ userId, isPrimary: true });
  }

  async findWarehouseAddress(userId) {
    return await this.findOne({ userId, isWarehouse: true });
  }

  async setPrimaryAddress(userId, addressId) {
    const transaction = await this.sequelize.transaction();

    try {
      // Remove primary flag from all user addresses
      await this.model.update(
        { isPrimary: false },
        { where: { userId }, transaction }
      );

      // Set the specified address as primary
      const [_, [updatedAddress]] = await this.model.update(
        { isPrimary: true },
        { where: { id: addressId, userId }, returning: true, transaction }
      );

      await transaction.commit();
      return updatedAddress;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async setWarehouseAddress(userId, addressId) {
    const transaction = await this.sequelize.transaction();

    try {
      // Remove warehouse flag from all user addresses
      await this.model.update(
        { isWarehouse: false },
        { where: { userId }, transaction }
      );

      // Set the specified address as warehouse
      const [_, [updatedAddress]] = await this.model.update(
        { isWarehouse: true },
        { where: { id: addressId, userId }, returning: true, transaction }
      );

      await transaction.commit();
      return updatedAddress;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async createWithFlags(userId, addressData) {
    const transaction = await this.sequelize.transaction();

    try {
      // If this is set as primary, remove primary flag from other addresses
      if (addressData.isPrimary) {
        await this.model.update(
          { isPrimary: false },
          { where: { userId }, transaction }
        );
      }

      // If this is set as warehouse, remove warehouse flag from other addresses
      if (addressData.isWarehouse) {
        await this.model.update(
          { isWarehouse: false },
          { where: { userId }, transaction }
        );
      }

      // Create the new address
      const newAddress = await this.create(addressData, { transaction });

      await transaction.commit();
      return newAddress;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateWithFlags(addressId, userId, addressData) {
    const transaction = await this.sequelize.transaction();

    try {
      // If this is set as primary, remove primary flag from other addresses
      if (addressData.isPrimary) {
        await this.model.update(
          { isPrimary: false },
          { where: { userId, id: { [Op.ne]: addressId } }, transaction }
        );
      }

      // If this is set as warehouse, remove warehouse flag from other addresses
      if (addressData.isWarehouse) {
        await this.model.update(
          { isWarehouse: false },
          { where: { userId, id: { [Op.ne]: addressId } }, transaction }
        );
      }

      // Update the address
      await this.update(addressId, addressData, {
        where: { userId },
        transaction,
      });

      await transaction.commit();
      return this.findById(addressId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteUserAddress(addressId, userId) {
    const address = await this.findById(addressId);
    if (!address || address.userId !== userId) return null;

    await this.delete(addressId);
    return address;
  }

  async searchNearbyAddresses(latitude, longitude, radiusKm = 10, limit = 50) {
    const { fn, col } = this.sequelize.Sequelize;
    return await this.findAll({
      attributes: {
        include: [
          [
            fn(
              'ST_DistanceSphere',
              fn('ST_MakePoint', col('longitude'), col('latitude')),
              fn('ST_MakePoint', longitude, latitude)
            ),
            'distance',
          ],
        ],
      },
      where: {
        [Op.and]: [
          this.sequelize.where(
            fn(
              'ST_DistanceSphere',
              fn('ST_MakePoint', col('longitude'), col('latitude')),
              fn('ST_MakePoint', longitude, latitude)
            ),
            { [Op.lte]: radiusKm * 1000 }
          ),
        ],
      },
      order: [['distance', 'ASC']],
      limit,
    });
  }

  async getAddressStats() {
    const { fn, col } = this.sequelize.Sequelize;
    const stats = await this.model.findAll({
      attributes: [
        [fn('COUNT', col('id')), 'totalAddresses'],
        [fn('COUNT', col('id')), 'primaryAddresses', { where: { isPrimary: true } }],
        [fn('COUNT', col('id')), 'warehouseAddresses', { where: { isWarehouse: true } }],
        [fn('COUNT', col('id')), 'withCoordinates', { where: { latitude: { [Op.ne]: null } } }],
        [fn('COUNT', fn('DISTINCT', col('userId'))), 'usersWithAddresses'],
      ],
      raw: true,
    });
    return stats[0];
  }

  async validateAddressOwnership(addressId, userId) {
    const address = await this.findOne({ id: addressId, userId });
    return !!address;
  }
}

module.exports = AddressRepository;