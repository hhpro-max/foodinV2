const BaseRepository = require('./base.repository');
const { LegalPerson } = require('../models');

class LegalPersonRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, LegalPerson);
  }

  async findByUserId(userId) {
    return await this.findOne({ userId });
  }

  async findByEconomicCode(economicCode) {
    return await this.findOne({ economicCode });
  }

  async createForUser(userId, economicCode, companyName) {
    return await this.create({ userId, economicCode, companyName });
  }

  async updateByUserId(userId, data, options = {}) {
    const person = await this.findByUserId(userId);
    if (person) {
      return await person.update(data, options);
    }
    return null;
  }
}

module.exports = LegalPersonRepository;