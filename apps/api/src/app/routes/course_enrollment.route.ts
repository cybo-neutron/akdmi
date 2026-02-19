import { FastifyInstance } from 'fastify';
import {
  enrollUserInCourse,
  unenrollUserFromCourse,
  getMyEnrollments,
  getEnrolledUsers,
} from '../controllers/course_enrollment.controller';
import {
  authenticationMiddleware,
  authenticateWithRole,
} from '../middleware/authentication.middleware';
import { UserRole } from '../constant/UserRoles';

export const courseEnrollmentRoutes = (fastify: FastifyInstance) => {
  // Enroll a user in a course (admin/manager only)
  fastify.post(
    '/enroll',
    {
      preHandler: [
        authenticateWithRole({
          roles: [UserRole.ADMIN, UserRole.MANAGER],
        }),
      ],
    },
    async function (request, reply) {
      await enrollUserInCourse(request, reply);
    }
  );

  // Unenroll a user from a course (admin/manager only)
  fastify.post(
    '/unenroll',
    {
      preHandler: [
        authenticateWithRole({
          roles: [UserRole.ADMIN, UserRole.MANAGER],
        }),
      ],
    },
    async function (request, reply) {
      await unenrollUserFromCourse(request, reply);
    }
  );

  // Get current user's enrollments
  fastify.get(
    '/my',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await getMyEnrollments(request, reply);
    }
  );

  // Get all enrolled users for a course (with pagination)
  fastify.get(
    '/course/:courseId',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await getEnrolledUsers(request, reply);
    }
  );
};
