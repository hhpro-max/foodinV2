const BaseRepository = require('./base.repository');
const { Tag } = require('../models');

class TagRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Tag);
  }

  async findByName(name) {
    return await this.findOne({ name });
  }

  async findOrCreateByName(name) {
    return await this.model.findOrCreate({ where: { name } });
  }
}

module.exports = TagRepository;