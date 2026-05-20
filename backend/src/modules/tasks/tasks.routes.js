const express = require('express');
const tasksController = require('./tasks.controller');
const authMiddleware = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createTaskSchema, updateTaskSchema, queryTasksSchema } = require('./tasks.schema');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(authMiddleware);

router.route('/')
  .get(validate({ query: queryTasksSchema }), tasksController.getTasks)
  .post(validate({ body: createTaskSchema }), tasksController.createTask);

router.route('/:id')
  .get(tasksController.getTaskById)
  .patch(validate({ body: updateTaskSchema }), tasksController.updateTask)
  .delete(tasksController.deleteTask);

module.exports = router;
