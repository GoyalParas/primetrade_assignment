const usersService = require('./users.service');
const { successResponse, paginatedResponse } = require('../../utils/apiResponse');

const getUsers = async (req, res, next) => {
  try {
    const { users, meta } = await usersService.getUsers(req.query);
    paginatedResponse(res, 'Users retrieved successfully', users, meta, 200);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await usersService.updateUserRole(req.params.id, req.body.role, req.user.id);
    successResponse(res, 'User role updated successfully', user, 200);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await usersService.deleteUser(req.params.id, req.user.id);
    successResponse(res, 'User deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
};
