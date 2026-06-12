import { FastifyInstance } from 'fastify';
import {
  upsertContentLog,
  getMyContentLog,
  getMyProgressForCourse,
} from '../controllers/user_content_log.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';

export const userContentLogRoutes = (fastify: FastifyInstance) => {
  fastify.post(
    '/upsert',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await upsertContentLog(request, reply);
    }
  );

  fastify.get(
    '/course/:courseId',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await getMyProgressForCourse(request, reply);
    }
  );

  fastify.get(
    '/content/:contentId',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await getMyContentLog(request, reply);
    }
  );
};
