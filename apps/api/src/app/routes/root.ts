import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.route';
import { authRoutes } from './auth.route';

export default async function (fastify: FastifyInstance) {

  fastify.register(userRoutes, {
    prefix: "users"
  })

  fastify.register(authRoutes, {
    prefix: "/v1/auth"
  })


  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });
}
