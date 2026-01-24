import { FastifyInstance } from 'fastify';
import { registerNewUser } from '../controllers/auth.controller';
import { logger } from '@org/utils';

export const authRoutes = (fastify: FastifyInstance) => {
  fastify.post('/register', async function (request, reply) {
    try {
      const { firstName, lastName, email, password } = request.body as {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      };

      const result = await registerNewUser({
        firstName,
        lastName,
        email,
        password,
      });
      logger.info('Created new user : ', result);

      return result;
    } catch (error) {
      logger.info('Error in registerNewUser', error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  fastify.post('/login', async function (request, reply) {});
};
