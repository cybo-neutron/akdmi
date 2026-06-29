import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getSignedUploadUrl, getSignedDownloadUrl } from '@org/aws';
import { authenticationMiddleware } from '../middleware/authentication.middleware';
import z from 'zod';
import { logger } from '@org/utils';

export const fileUploadRoutes = (fastify: FastifyInstance, opts: unknown, done: (err?: Error) => void) => {
  fastify.post(
    '/signed-url',
    { preHandler: [authenticationMiddleware] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const schema = z.object({
          bucketName: z.string().min(1),
          objectKey: z.string().min(1),
          contentType: z.string().min(1),
        });

        const result = schema.safeParse(request.body);
        if (!result.success) {
          return reply
            .status(400)
            .send({ message: 'Invalid upload request', errors: result.error.issues });
        }

        const { bucketName, objectKey, contentType } = result.data;
        const signedUrl = await getSignedUploadUrl(bucketName, objectKey, contentType);

        return reply.status(200).send({ signedUrl });
      } catch (error: unknown) {
        logger.error('Error generating pre-signed upload URL:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return reply
          .status(500)
          .send({ message: errorMessage });
      }
    }
  );

  fastify.post(
    '/signed-url-for-download',
    { preHandler: [authenticationMiddleware] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const schema = z.object({
          bucketName: z.string().min(1),
          objectKey: z.string().min(1),
        });

        const result = schema.safeParse(request.body);
        if (!result.success) {
          return reply
            .status(400)
            .send({ message: 'Invalid download request', errors: result.error.issues });
        }

        const { bucketName, objectKey } = result.data;
        const signedUrl = await getSignedDownloadUrl(bucketName, objectKey);

        return reply.status(200).send({ signedUrl });
      } catch (error: unknown) {
        logger.error('Error generating pre-signed download URL:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return reply
          .status(500)
          .send({ message: errorMessage });
      }
    }
  );

  done();
};
