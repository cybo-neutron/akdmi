import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { logger } from '@org/utils';
import { UserRoleType } from '../constant/UserRoles';
import { getUserById } from '@org/database';

export async function authenticationMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply
        .status(401)
        .send({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    // Using try-catch for jwt.verify specifically to handle expiration/malformed tokens
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return reply.status(401).send({ message: 'Unauthorized: Invalid token' });
    }

    if (!decodedToken || !decodedToken.userId) {
      return reply
        .status(401)
        .send({ message: 'Unauthorized: Malformed token payload' });
    }

    // const user = await getUserById({ id: decodedToken.userId });

    // if (!user) {
    //   return reply
    //     .status(401)
    //     .send({ message: 'Unauthorized: User not found' });
    // }

    // // remove password
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { password: _, ...userResponse } = user;

    request.user = decodedToken;
  } catch (error: any) {
    logger.error('Error in authenticationMiddleware:', error);
    return reply.status(500).send({ message: 'Internal Server Error' });
  }
}

export function authenticateWithRole({ roles }: { roles: UserRoleType[] }) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply
          .status(401)
          .send({ message: 'Unauthorized: Missing or invalid token' });
      }

      const token = authHeader.split(' ')[1];

      let decodedToken: any;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
      } catch (err) {
        return reply
          .status(401)
          .send({ message: 'Unauthorized: Invalid token' });
      }

      if (!decodedToken || !decodedToken.userId) {
        return reply
          .status(401)
          .send({ message: 'Unauthorized: Malformed token payload' });
      }

      const user = await getUserById({ id: decodedToken.userId });

      if (!user) {
        return reply
          .status(401)
          .send({ message: 'Unauthorized: User not found' });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const { password: _, ...userResponse } = user;

      // if (!user.role || !roles.includes(user.role)) {
      //   return reply
      //     .status(401)
      //     .send({ message: 'Unauthorized: User not found' });
      // }

      request.user = decodedToken;
    } catch (error: any) {
      logger.error('Error in authenticationMiddleware:', error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  };
}
