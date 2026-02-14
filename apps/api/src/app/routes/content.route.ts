import { FastifyInstance } from 'fastify';
import {
  createContent,
  getContentsByCourse,
  getContentById,
  updateContent,
  deleteContent,
  saveContentText,
  saveContentMedia,
  saveContentDocument,
} from '../controllers/content.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';

export const contentRoutes = (fastify: FastifyInstance) => {
  // ─── Base Content ─────────────────────────────────────

  // Create new content (chapter or topic)
  fastify.post(
    '/create',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await createContent(request, reply);
    }
  );

  // Get all contents for a course
  fastify.get(
    '/course/:courseId',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await getContentsByCourse(request, reply);
    }
  );

  fastify.post('',{preHandler:[authenticationMiddleware]},async function(request,reply){
    
  })

  // Get content by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await getContentById(request, reply);
    }
  );

  // Update content
  fastify.patch(
    '/update',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await updateContent(request, reply);
    }
  );

  // Delete content (soft delete)
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await deleteContent(request, reply);
    }
  );

  // ─── Type-Specific Content ─────────────────────────────

  // Save text content (create or update)
  fastify.post(
    '/text/save',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await saveContentText(request, reply);
    }
  );

  // Save media content (create or update)
  fastify.post(
    '/media/save',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await saveContentMedia(request, reply);
    }
  );

  // Save document content (create or update)
  fastify.post(
    '/document/save',
    {
      preHandler: [authenticationMiddleware],
    },
    async function (request, reply) {
      await saveContentDocument(request, reply);
    }
  );
};
