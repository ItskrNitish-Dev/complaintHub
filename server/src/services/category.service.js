const { Category, Department } = require('../models');
const { AppError } = require('../utils/apiResponse');
const { ALL_PRIORITIES } = require('../constants/priorities');

const getAllCategories = async (query = {}) => {
  const filter = {};
  if (query.activeOnly === 'true') {
    filter.isActive = true;
  }
  if (query.department) {
    filter.department = query.department;
  }
  return Category.find(filter).populate('department').sort({ name: 1 });
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id).populate('department');
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  return category;
};

const createCategory = async (data) => {
  const { name, department, defaultPriority, description, icon } = data;

  if (!name || !department) {
    throw new AppError('Category name and associated department are required', 400, 'MISSING_FIELDS');
  }

  const deptExists = await Department.findById(department);
  if (!deptExists) {
    throw new AppError('Associated department does not exist', 400, 'INVALID_DEPARTMENT');
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    throw new AppError('A category with that name already exists', 409, 'CATEGORY_EXISTS');
  }

  const priority = defaultPriority && ALL_PRIORITIES.includes(defaultPriority)
    ? defaultPriority
    : 'MEDIUM';

  const category = await Category.create({
    name: name.trim(),
    department,
    defaultPriority: priority,
    description: description ? description.trim() : '',
    icon: icon || 'AlertCircle',
    isActive: true,
  });

  return category.populate('department');
};

const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (data.department) {
    const deptExists = await Department.findById(data.department);
    if (!deptExists) {
      throw new AppError('Associated department does not exist', 400, 'INVALID_DEPARTMENT');
    }
    category.department = data.department;
  }

  if (data.name) category.name = data.name.trim();
  if (data.description !== undefined) category.description = data.description.trim();
  if (data.defaultPriority && ALL_PRIORITIES.includes(data.defaultPriority)) {
    category.defaultPriority = data.defaultPriority;
  }
  if (data.icon) category.icon = data.icon;
  if (data.isActive !== undefined) category.isActive = Boolean(data.isActive);

  await category.save();
  return category.populate('department');
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  await Category.findByIdAndDelete(id);
  return { id };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
