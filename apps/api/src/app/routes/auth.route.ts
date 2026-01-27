import { FastifyInstance } from 'fastify';
import {
  registerNewUser,
  loginUser,
  verifyAccessToken,
  getAllPermissions,
} from '../controllers/auth.controller';

export const authRoutes = (fastify: FastifyInstance) => {
  fastify.post('/register', async function (request, reply) {
    await registerNewUser(request, reply);
  });

  fastify.post('/login', async function (request, reply) {
    await loginUser(request, reply);
  });

  fastify.get('/me', async function (request, reply) {
    await verifyAccessToken(request, reply);
  });

  fastify.get('/permissions', async function (request, reply) {
    await getAllPermissions(request, reply);
  });
};
