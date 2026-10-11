const departmentService = require('../services/department.service');
const { successResponse } = require('../utils/apiResponse');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getAllDepartments(req.query);
    return successResponse(res, 200, 'Departments retrieved successfully', departments);
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    return successResponse(res, 200, 'Department details', { department });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    return successResponse(res, 201, 'Department created successfully', { department });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    return successResponse(res, 200, 'Department updated successfully', { department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const result = await departmentService.deleteDepartment(req.params.id);
    return successResponse(res, 200, 'Department deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
