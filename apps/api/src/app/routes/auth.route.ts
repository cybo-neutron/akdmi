import { FastifyInstance } from 'fastify';
import { registerNewUser, loginUser } from '../controllers/auth.controller';
import { logger } from '@org/utils';

export const authRoutes = (fastify: FastifyInstance) => {
  fastify.post('/register', async function (request, reply) {
    try {
      logger.info("Registering new user");
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

      logger.info("User registered successfully : ", result);


      return reply.status(201).send(result);
    } catch (error: any) {
      logger.error("Error in registerNewUser : ", error);
      return reply
        .status(500)
        .send({ message: error?.message || 'Internal server error' });
    }
  });

  fastify.post('/login', async function (request, reply) {
    try {
      logger.info("Logging in user");
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const result = await loginUser({ email, password });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply
        .status(500)
        .send({ message: error?.message || 'Internal server error' });
    }
  });
};
