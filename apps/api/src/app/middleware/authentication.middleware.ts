import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { logger } from '@org/utils';

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

    request.user = decodedToken;
  } catch (error: any) {
    logger.error('Error in authenticationMiddleware:', error);
    return reply.status(500).send({ message: 'Internal Server Error' });
  }
}
