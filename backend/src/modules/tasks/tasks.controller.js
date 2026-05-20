const tasksService = require('./tasks.service');
const { successResponse, paginatedResponse } = require('../../utils/apiResponse');

const getTasks = async (req, res, next) => {
  try {
    const { tasks, meta } = await tasksService.getTasks(
      req.user.id,
      req.query,
      req.user.role === 'ADMIN'
    );
    paginatedResponse(res, 'Tasks retrieved successfully', tasks, meta, 200);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await tasksService.getTaskById(
      req.params.id,
      req.user.id,
      req.user.role === 'ADMIN'
    );
    successResponse(res, 'Task retrieved successfully', task, 200);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await tasksService.createTask(req.user.id, req.body);
    successResponse(res, 'Task created successfully', task, 201);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(
      req.params.id,
      req.user.id,
      req.body,
      req.user.role === 'ADMIN'
    );
    successResponse(res, 'Task updated successfully', task, 200);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await tasksService.deleteTask(
      req.params.id,
      req.user.id,
      req.user.role === 'ADMIN'
    );
    successResponse(res, 'Task deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
