import fastify, { FastifyInstance } from 'fastify';
import { createCourse } from '../controllers/course.controller';

export const courseRoutes = (fastify: FastifyInstance) => {
  fastify.post('/create', async function (request, reply) {
    createCourse(request, reply);
  });

  fastify.get("/", async function (request, reply) {
    
  })
};
