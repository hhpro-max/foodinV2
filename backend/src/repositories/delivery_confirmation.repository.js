const BaseRepository = require('./base.repository');

class DeliveryConfirmationRepository extends BaseRepository {
  constructor(sequelize) {
    const DeliveryConfirmation = sequelize.models.DeliveryConfirmation;
    super(sequelize, DeliveryConfirmation);
  }
}

module.exports = DeliveryConfirmationRepository;