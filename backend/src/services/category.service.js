const ApiError = require('../utils/ApiError');

class CategoryService {
  constructor({ categoryRepo }) {
    this.categoryRepo = categoryRepo;
  }

  async getAllCategories(filters = {}) {
    const { page = 1, limit = 20, includeChildren = false } = filters;
    const offset = (page - 1) * limit;

    let categories;
    if (includeChildren) {
      categories = await this.categoryRepo.findCategoryHierarchy();
    } else {
      categories = await this.categoryRepo.findAll(
        { isActive: true },
        [['name', 'ASC']],
        limit,
        offset
      );
    }

    return {
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: categories.length,
      },
    };
  }

  async getRootCategories() {
    const categories = await this.categoryRepo.findRootCategories();
    return categories;
  }

  async getCategoryById(id) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }

  async getCategoriesByParent(parentId) {
    const categories = await this.categoryRepo.findByParent(parentId);
    return categories;
  }

  async createCategory(categoryData) {
    // Validate parent category if provided
    if (categoryData.parentId) {
      const parentCategory = await this.categoryRepo.findById(categoryData.parentId);
      if (!parentCategory) {
        throw ApiError.notFound('Parent category not found');
      }
    }

    const category = await this.categoryRepo.create({
      name: categoryData.name,
      description: categoryData.description,
      parentId: categoryData.parentId,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
    });

    return category;
  }

  async updateCategory(id, categoryData) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Validate parent category if provided
    if (categoryData.parentId) {
      const parentCategory = await this.categoryRepo.findById(categoryData.parentId);
      if (!parentCategory) {
        throw ApiError.notFound('Parent category not found');
      }
    }

    const updatedCategory = await this.categoryRepo.update(id, categoryData);
    return updatedCategory;
  }

  async deleteCategory(id) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Check if category has children
    const children = await this.categoryRepo.findByParent(id);
    if (children.length > 0) {
      throw ApiError.badRequest('Cannot delete category with children. Delete children first.');
    }

    // Soft delete by setting isActive to false
    await this.categoryRepo.update(id, { isActive: false });
    return { message: 'Category deleted successfully' };
  }
}

module.exports = CategoryService;