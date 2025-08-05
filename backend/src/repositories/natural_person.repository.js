const BaseRepository = require('./base.repository');
const { NaturalPerson } = require('../models');

class NaturalPersonRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, NaturalPerson);
  }

  async findByUserId(userId) {
    return await this.findOne({ userId });
  }

  async findByNationalId(nationalId) {
    return await this.findOne({ nationalId });
  }

  async createForUser(userId, nationalId) {
    return await this.create({ userId, nationalId });
  }

  async updateByUserId(userId, data, options = {}) {
    const person = await this.findByUserId(userId);
    if (person) {
      return await person.update(data, options);
    }
    return null;
  }
}

module.exports = NaturalPersonRepository;