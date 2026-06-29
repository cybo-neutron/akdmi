import {
  createUser,
  getAllRoleResourcePermissions,
  getUserByEmail,
  getUserById,
} from '@org/database/repo';
import bcrypt from 'bcrypt';
import z from 'zod';
import jwt from 'jsonwebtoken';
import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '@org/utils';

export async function registerNewUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const newUserData = request.body;

  const validateUser = z.object({
    firstName: z.string().max(255).optional(),
    lastName: z.string().max(255).optional(),
    email: z.email(),
    password: z.string().min(8).max(255),
  });
  const validateUserResult = validateUser.safeParse(newUserData);

  if (!validateUserResult.success) {
    throw new Error(validateUserResult.error.message);
  }

  const { firstName, lastName, email, password } = validateUserResult.data;
  const findUser = await getUserByEmail({ email });

  logger.info('newUserData: ', newUserData);

  if (findUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const tokenPayload = {
      userId: newUser.id,
      role: newUser.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    reply.status(201).send({
      token,
      userId: newUser.id,
      role: newUser.role,
    });
  } catch (error: any) {
    logger.error('Error in registerNewUser: ', error);
    reply.status(500).send({
      message: error?.message || 'Internal server error',
    });
  }
}

export async function loginUser(request: FastifyRequest, reply: FastifyReply) {
  const loginData = request.body;

  const validateUser = z.object({
    email: z.email(),
    password: z.string().min(8).max(255),
  });

  const validateUserResult = validateUser.safeParse(loginData);
  if (!validateUserResult.success) {
    throw new Error(validateUserResult.error.message);
  }
  const { email, password } = validateUserResult.data;

  try {
    const user = await getUserByEmail({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const tokenPayload = {
      userId: user.id,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    reply.status(200).send({
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (error: any) {
    logger.error('Error in loginUser: ', error);
    reply.status(500).send({
      message: error?.message || 'Internal server error',
    });
  }
}

export async function verifyAccessToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token not found');
    }
    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const { userId } = decodedToken;

    const user = await getUserById({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    reply.status(200).send({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
      avatarUrl: user.avatarUrl
    });
  } catch (error: any) {
    logger.error('Error in verifyAccessToken: ', error);
    reply.status(500).send({
      message: error?.message || 'Internal server error',
    });
  }
}

export async function getAllPermissions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const permissions = await getAllRoleResourcePermissions();

    reply.status(200).send({
      permissions,
    });
  } catch (error: any) {
    logger.error('Error in getAllPermissions: ', error);
    reply.status(500).send({
      message: error?.message || 'Internal server error',
    });
  }
}
