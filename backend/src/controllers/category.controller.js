const catchAsync = require('../utils/catchAsync');

const getCategories = catchAsync(async (req, res) => {
  const filters = req.query;

  const result = await req.container.categoryService.getAllCategories(filters);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getRootCategories = catchAsync(async (req, res) => {
  const categories = await req.container.categoryService.getRootCategories();

  res.status(200).json({
    status: 'success',
    data: { categories },
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const category = await req.container.categoryService.getCategoryById(categoryId);

  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

const getCategoriesByParent = catchAsync(async (req, res) => {
  const { parentId } = req.params;

  const categories = await req.container.categoryService.getCategoriesByParent(parentId);

  res.status(200).json({
    status: 'success',
    data: { categories },
  });
});

const createCategory = catchAsync(async (req, res) => {
  const categoryData = req.body;

  const category = await req.container.categoryService.createCategory(categoryData);

  res.status(201).json({
    status: 'success',
    data: { category },
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const categoryData = req.body;

  const category = await req.container.categoryService.updateCategory(categoryId, categoryData);

  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const result = await req.container.categoryService.deleteCategory(categoryId);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  getCategories,
  getRootCategories,
  getCategoryById,
  getCategoriesByParent,
  createCategory,
  updateCategory,
  deleteCategory,
};