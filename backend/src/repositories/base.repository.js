class BaseRepository {
  constructor(sequelize, model) {
    this.sequelize = sequelize;
    this.model = model;
    // Expose the raw database connection for cases where raw queries are needed
    this.db = sequelize;
  }

  async findAll(conditions = {}, orderBy = [['createdAt', 'DESC']], limit = null, offset = null) {
    return await this.model.findAll({
      where: conditions,
      order: orderBy,
      limit,
      offset,
    });
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async findOne(conditions) {
    return await this.model.findOne({ where: conditions });
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data, options = {}) {
    const instance = await this.model.findByPk(id);
    if (!instance) return null;
    return await instance.update(data, options);
  }

  async delete(id) {
    const instance = await this.model.findByPk(id);
    if (!instance) return false;
    await instance.destroy();
    return true;
  }

  async count(conditions = {}) {
    return await this.model.count({ where: conditions });
  }
}

module.exports = BaseRepository;