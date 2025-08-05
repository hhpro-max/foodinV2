const BaseRepository = require('./base.repository');
const { Category } = require('../models');

class CategoryRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Category);
  }

  async findWithChildren(id) {
    return await this.findAll({ id }, {
      include: {
        model: Category,
        as: 'children',
        where: { isActive: true },
        required: false,
        hierarchy: true,
      },
      order: [['level', 'ASC'], ['name', 'ASC']],
    });
  }

  async findRootCategories() {
    return await this.findAll({ parentId: null, isActive: true }, [['name', 'ASC']]);
  }

  async findByParent(parentId) {
    return await this.findAll({ parentId, isActive: true }, [['name', 'ASC']]);
  }

  async findCategoryHierarchy() {
    return await this.findAll({ isActive: true }, {
      include: {
        model: Category,
        as: 'children',
        hierarchy: true,
      },
      order: [['name', 'ASC']],
    });
  }
}

module.exports = CategoryRepository;