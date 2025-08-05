const BaseRepository = require('./base.repository');
const { Role } = require('../models');

class RoleRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Role);
  }

  async findByName(name) {
    return await this.findOne({ name });
  }
}

module.exports = RoleRepository;
