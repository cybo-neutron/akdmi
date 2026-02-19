import fastify, { FastifyInstance } from 'fastify';
import { createNewCourse, getCourseById } from '../controllers/course.controller';
import { getAllCourses } from '../controllers/course.controller';
import { updateCourse } from '../controllers/course.controller';
import { authenticateWithRole, authenticationMiddleware } from '../middleware/authentication.middleware';
import { deleteCourse } from '../controllers/course.controller';
import { UserRole } from '../constant/UserRoles';

export const courseRoutes = (fastify: FastifyInstance) => {
  fastify.post(
    '/create',
    {
      preHandler: [authenticateWithRole({roles : [UserRole.ADMIN,UserRole.MANAGER,UserRole.MENTOR]})],
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

  fastify.get('/:id', {
    preHandler: [authenticationMiddleware],
  },async function (request, reply) {
    await getCourseById(request, reply);
  });

  fastify.patch('/update', {
    preHandler: [authenticateWithRole({roles : [UserRole.ADMIN,UserRole.MANAGER,UserRole.MENTOR]})],
  },async function (request, reply) {
    await updateCourse(request, reply);
  });

  fastify.delete('/:id', {
    preHandler: [authenticateWithRole({roles : [UserRole.ADMIN,UserRole.MANAGER,UserRole.MENTOR]})],
  },async function (request, reply) {
    await deleteCourse(request, reply);
  });
};
