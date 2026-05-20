const prisma = require('../../config/db');
const cache = require('../../utils/cache');
const { NotFoundError, ForbiddenError } = require('../../utils/apiError');

// Helper to invalidate task caches for a user
const invalidateUserTasksCache = (userId) => {
  cache.delByPrefix(`tasks:${userId}`);
  // If task changes, we also invalidate the admin task lists to keep them fresh
  cache.delByPrefix('tasks:admin');
};

/**
 * Get paginated & filtered tasks
 */
const getTasks = async (userId, filters, isAdmin = false) => {
  const { page, limit, status, priority, search } = filters;
  const skip = (page - 1) * limit;

  // Build prisma query conditions
  const where = {};
  
  // If not admin, restrict to own tasks
  if (!isAdmin) {
    where.userId = userId;
  }

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Attempt to read from cache (only for non-admin queries to keep cache logic simple)
  const cacheKey = isAdmin 
    ? `tasks:admin:${JSON.stringify(filters)}`
    : `tasks:${userId}:${JSON.stringify(filters)}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Database queries
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const result = {
    tasks,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  // Cache results
  cache.set(cacheKey, result);

  return result;
};

/**
 * Get single task by ID
 */
const getTaskById = async (id, userId, isAdmin = false) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Guard: checks if the requester owns the task or is an administrator
  if (!isAdmin && task.userId !== userId) {
    throw new ForbiddenError('You do not have permission to access this task');
  }

  return task;
};

/**
 * Create a new task
 */
const createTask = async (userId, taskData) => {
  const task = await prisma.task.create({
    data: {
      ...taskData,
      userId,
    },
  });

  // Evict cache
  invalidateUserTasksCache(userId);

  return task;
};

/**
 * Update a task
 */
const updateTask = async (id, userId, taskData, isAdmin = false) => {
  const task = await getTaskById(id, userId, isAdmin);

  const updatedTask = await prisma.task.update({
    where: { id },
    data: taskData,
  });

  // Evict cache for the owner of the task
  invalidateUserTasksCache(task.userId);

  return updatedTask;
};

/**
 * Delete a task
 */
const deleteTask = async (id, userId, isAdmin = false) => {
  const task = await getTaskById(id, userId, isAdmin);

  await prisma.task.delete({
    where: { id },
  });

  // Evict cache for the owner of the task
  invalidateUserTasksCache(task.userId);

  return { id };
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
