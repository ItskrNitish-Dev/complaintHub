const { Department } = require('../models');
const { AppError } = require('../utils/apiResponse');

const getAllDepartments = async (query = {}) => {
  const filter = {};
  if (query.activeOnly === 'true') {
    filter.isActive = true;
  }
  return Department.find(filter).sort({ name: 1 });
};

const getDepartmentById = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
  }
  return department;
};

const createDepartment = async (data) => {
  const { name, code, description } = data;
  if (!name || !code) {
    throw new AppError('Department name and code are required', 400, 'MISSING_FIELDS');
  }

  const existing = await Department.findOne({
    $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }],
  });

  if (existing) {
    throw new AppError('A department with that name or code already exists', 409, 'DEPARTMENT_EXISTS');
  }

  return Department.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description ? description.trim() : '',
    isActive: true,
  });
};

const updateDepartment = async (id, data) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
  }

  if (data.name) department.name = data.name.trim();
  if (data.code) department.code = data.code.trim().toUpperCase();
  if (data.description !== undefined) department.description = data.description.trim();
  if (data.isActive !== undefined) department.isActive = Boolean(data.isActive);

  await department.save();
  return department;
};

const deleteDepartment = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
  }

  await Department.findByIdAndDelete(id);
  return { id };
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
