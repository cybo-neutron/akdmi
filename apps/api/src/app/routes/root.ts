import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.route';
import { authRoutes } from './auth.route';
import { courseRoutes } from './course.route';
import { contentRoutes } from './content.route';

export default async function (fastify: FastifyInstance) {
  fastify.register(userRoutes, {
    prefix: 'users',
  });

  fastify.register(authRoutes, {
    prefix: '/v1/auth',
  });

  fastify.register(courseRoutes, {
    prefix: '/v1/courses',
  });

  fastify.register(contentRoutes, {
    prefix: '/v1/contents',
  });

  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });
}
