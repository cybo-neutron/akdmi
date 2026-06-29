import { FastifyInstance } from 'fastify';
import {
  createNewUser,
  getAllUsers,
  getUserById,
  updateExistingUser,
  deleteExistingUser,
} from '../controllers/user.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';

export const userRoutes = (fastify: FastifyInstance, done: any) => {
  fastify.post('/create', async function (request, reply) {
    await createNewUser(request, reply);
  });

  fastify.get('/:id', async function (request, reply) {
    await getUserById(request, reply);
  });

  fastify.get('/', async function (request, reply) {
    await getAllUsers(request, reply);
  });

  fastify.patch('/:id', { preHandler: [authenticationMiddleware] }, async function (request, reply) {
    await updateExistingUser(request, reply);
  });

  fastify.delete('/:id', async function (request, reply) {
    await deleteExistingUser(request, reply);
  });
};
