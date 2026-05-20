const { z } = require('zod');

const queryUsersSchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
  limit: z.string().optional().default('10').transform((val) => Math.max(1, parseInt(val, 10))),
});

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { message: "Role must be either 'USER' or 'ADMIN'" }),
});

module.exports = {
  queryUsersSchema,
  updateRoleSchema,
};
