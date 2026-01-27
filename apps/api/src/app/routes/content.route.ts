import fastify, { FastifyInstance } from 'fastify';
import { createContent } from '../controllers/content.controller';

export const contentRoutes = (fastify: FastifyInstance) => {
  fastify.post('/create', async function (request, reply) {
    createContent(request, reply);
  });

  fastify.get('/', async function (request, reply) {});
};
