import fastify, { FastifyInstance } from 'fastify';
import { createNewCourse } from '../controllers/course.controller';
import { getAllCourses } from '../controllers/course.controller';
import { updateCourse } from '../controllers/course.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';
import { deleteCourse } from '../controllers/course.controller';

export const courseRoutes = (fastify: FastifyInstance) => {
  fastify.post(
    '/create',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await createNewCourse(request, reply);
    }
  );

  fastify.get('/', {
    preHandler: [authenticationMiddleware],
  },async function (request, reply) {
    await getAllCourses(request, reply);
  });

  fastify.patch('/update', {
    preHandler: [authenticationMiddleware],
  },async function (request, reply) {
    await updateCourse(request, reply);
  });

  fastify.delete('/:id', {
    preHandler: [authenticationMiddleware],
  },async function (request, reply) {
    await deleteCourse(request, reply);
  });
};
