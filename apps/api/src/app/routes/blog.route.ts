import { FastifyInstance } from 'fastify';
import {
  createNewBlog,
  getBlogById,
  getAllBlogs,
  updateExistingBlog,
  deleteExistingBlog,
} from '../controllers/blog.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';

export const blogRoutes = (fastify: FastifyInstance) => {
  // Create a new blog (authenticated)
  fastify.post(
    '/create',
    { preHandler: [authenticationMiddleware] },
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
    { preHandler: [authenticationMiddleware] },
    async function (request, reply) {
      await updateExistingBlog(request, reply);
    }
  );

  // Delete a blog (authenticated)
  fastify.delete(
    '/:id',
    { preHandler: [authenticationMiddleware] },
    async function (request, reply) {
      await deleteExistingBlog(request, reply);
    }
  );
};
