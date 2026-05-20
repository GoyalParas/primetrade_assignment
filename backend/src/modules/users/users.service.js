const prisma = require('../../config/db');
const { NotFoundError, BadRequestError } = require('../../utils/apiError');
const cache = require('../../utils/cache');

/**
 * Get paginated list of all users
 */
const getUsers = async (filters) => {
  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  // Let's cache users list queries under users:admin
  const cacheKey = `users:admin:${JSON.stringify(filters)}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tasks: true },
        },
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const result = {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  cache.set(cacheKey, result);
  return result;
};

/**
 * Update a user's role
 */
const updateUserRole = async (id, role, updaterId) => {
  if (id === updaterId) {
    throw new BadRequestError('You cannot change your own role');
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  // Evict admin users list cache
  cache.delByPrefix('users:admin');

  return updatedUser;
};

/**
 * Delete a user account
 */
const deleteUser = async (id, updaterId) => {
  if (id === updaterId) {
    throw new BadRequestError('You cannot delete your own admin account');
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  await prisma.user.delete({
    where: { id },
  });

  // Evict caches
  cache.delByPrefix('users:admin');
  cache.delByPrefix(`tasks:${id}`);
  cache.delByPrefix('tasks:admin');

  return { id };
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
};
