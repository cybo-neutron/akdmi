import { FastifyReply, FastifyRequest } from 'fastify';
import {
  createUser,
  getUserByEmail,
  getUserById as getUserByIdRepo,
  getAllUsers as getAllUsersRepo,
  updateUser as updateUserRepo,
  deleteUser as deleteUserRepo,
} from '@org/database/repo';
import z from 'zod';
import bcrypt from 'bcrypt';
import { logger } from '@org/utils';
import { UserRole } from '../constant/UserRoles';

export async function createNewUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userSchema = z.object({
      firstName: z.string().max(255).optional(),
      lastName: z.string().max(255).optional(),
      email: z.email(),
      password: z.string().min(8).max(255),
      role: z.enum(Object.values(UserRole)).optional(),
      avatarUrl: z.url().optional(),
    });

    const result = userSchema.safeParse(request.body);

    if (!result.success) {
      logger.error('Invalid user data: ', result.error);
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { firstName, lastName, email, password, role, avatarUrl } =
      result.data;

    const existingUser = await getUserByEmail({ email });
    if (existingUser) {
      return reply.status(409).send({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      avatarUrl,
    });

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    return reply.status(201).send(userResponse);
  } catch (error: any) {
    logger.error('Error in createNewUser controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Get user by id
export async function getUserById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const validateResult = validateData.safeParse(request.params);

    if (!validateResult.success) {
      logger.error('Invalid user ID: ', validateResult.error);
      return reply.status(400).send({ message: 'Invalid user ID' });
    }

    const { id } = validateResult.data;
    const user = await getUserByIdRepo({ id });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return reply.status(200).send(userResponse);
  } catch (error: any) {
    logger.error('Error in getUserById controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Get all users
export async function getAllUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 1)),
      limit: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 10)),
      search: z.string().optional(),
    });

    const queryResult = querySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({ message: 'Invalid query parameters' });
    }

    const { page, limit, search } = queryResult.data;

    const result = await getAllUsersRepo({ page, limit, search });

    // Remove password from all users
    const usersResponse = result.users.map((user) => {
      const { password: _, ...userResponse } = user;
      return userResponse;
    });

    return reply.status(200).send({
      users: usersResponse,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    logger.error('Error in getAllUsers controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Update user
export async function updateExistingUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const userSchema = z.object({
      firstName: z.string().max(255).optional(),
      lastName: z.string().max(255).optional(),
      email: z.string().email().optional(),
      role: z.enum(Object.values(UserRole)).optional(),
      avatarUrl: z.string().url().optional(),
    });

    const paramsResult = paramsSchema.safeParse(request.params);
    const bodyResult = userSchema.safeParse(request.body);

    if (!paramsResult.success || !bodyResult.success) {
      return reply.status(400).send({ message: 'Invalid data' });
    }

    const { id } = paramsResult.data;
    const updatedUser = await updateUserRepo(id, bodyResult.data);

    if (!updatedUser) {
      return reply.status(404).send({ message: 'User not found' });
    }

    const { password: _, ...userResponse } = updatedUser;
    return reply.status(200).send(userResponse);
  } catch (error: any) {
    logger.error('Error in updateExistingUser controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Delete user
export async function deleteExistingUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const paramsResult = paramsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({ message: 'Invalid user ID' });
    }

    const { id } = paramsResult.data;
    const deleted = await deleteUserRepo(id);

    if (!deleted) {
      return reply.status(404).send({ message: 'User not found' });
    }

    return reply.status(200).send({ message: 'User deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteExistingUser controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}
