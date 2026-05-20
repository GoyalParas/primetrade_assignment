const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must not exceed 100 characters').trim(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  dueDate: z
    .string()
    .datetime({ message: 'dueDate must be a valid ISO 8601 date string' })
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

const updateTaskSchema = createTaskSchema.partial();

const queryTasksSchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
  limit: z.string().optional().default('10').transform((val) => Math.max(1, parseInt(val, 10))),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  search: z.string().optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  queryTasksSchema,
};
