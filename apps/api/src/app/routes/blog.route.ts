import { FastifyInstance } from 'fastify';
import {
  createNewBlog,
  getBlogById,
  getAllBlogs,
  updateExistingBlog,
  deleteExistingBlog,
} from '../controllers/blog.controller';
import { authenticateWithRole } from '../middleware/authentication.middleware';
import { UserRole } from '../constant/UserRoles';

export const blogRoutes = (fastify: FastifyInstance) => {
  // Create a new blog (authenticated)
  fastify.post(
    '/create',
    {
      preHandler: [
        authenticateWithRole({
          roles: [UserRole.ADMIN, UserRole.MANAGER],
        }),
      ],
    },
    async function (request, reply) {
      await createNewBlog(request, reply);
    }
  );

  // Get all blogs (public)
  fastify.get('/', async function (request, reply) {
    await getAllBlogs(request, reply);
  });

  // Get blog by id (public)
  fastify.get('/:id', async function (request, reply) {
    await getBlogById(request, reply);
  });

  // Update a blog (authenticated)
  fastify.patch(
    '/:id',
    {
      preHandler: [
        authenticateWithRole({
          roles: [UserRole.ADMIN, UserRole.MANAGER],
        }),
      ],
    },
    async function (request, reply) {
      await updateExistingBlog(request, reply);
    }
  );

  // Delete a blog (authenticated)
  fastify.delete(
    '/:id',
    {
      preHandler: [
        authenticateWithRole({
          roles: [UserRole.ADMIN, UserRole.MANAGER],
        }),
      ],
    },
    async function (request, reply) {
      await deleteExistingBlog(request, reply);
    }
  );
};
