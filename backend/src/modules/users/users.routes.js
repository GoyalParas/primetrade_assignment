const express = require('express');
const usersController = require('./users.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { queryUsersSchema, updateRoleSchema } = require('./users.schema');

const router = express.Router();

// Apply auth and admin check to all routes in this router
router.use(authMiddleware, authorize('ADMIN'));

router.route('/')
  .get(validate({ query: queryUsersSchema }), usersController.getUsers);

router.route('/:id/role')
  .patch(validate({ body: updateRoleSchema }), usersController.updateUserRole);

router.route('/:id')
  .delete(usersController.deleteUser);

module.exports = router;
