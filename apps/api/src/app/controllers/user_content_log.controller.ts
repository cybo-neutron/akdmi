import { FastifyReply, FastifyRequest } from 'fastify';
import {
  upsertUserContentLog,
  getUserContentLog,
  getContentLogsByUserAndCourse,
  getCourseProgressSummary,
} from '@org/database/repo';
import z from 'zod';
import { logger } from '@org/utils';

const completionStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
]);

// Upsert a content log entry (mark as in_progress or completed)
export async function upsertContentLog(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const bodySchema = z.object({
      contentId: z.number(),
      completionStatus: completionStatusSchema,
    });

    const result = bodySchema.safeParse(request.body);

    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const userId = (request.user as { userId: number })?.userId;

    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { contentId, completionStatus } = result.data;

    const log = await upsertUserContentLog(userId, contentId, completionStatus);

    return reply.status(200).send(log);
  } catch (error: unknown) {
    logger.error('Error in upsertContentLog controller: ', error);
    return reply.status(500).send({
      message: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

// Get completion status for a specific content item for the current user
export async function getMyContentLog(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      contentId: z.string().transform((v) => Number(v)),
    });

    const paramsResult = paramsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({ message: 'Invalid content ID' });
    }

    const userId = (request.user as { userId: number })?.userId;

    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { contentId } = paramsResult.data;

    const log = await getUserContentLog(userId, contentId);

    if (!log) {
      // Return a default "not started" shape rather than 404
      return reply.status(200).send({
        userId,
        contentId,
        completionStatus: 'not_started',
      });
    }

    return reply.status(200).send(log);
  } catch (error: unknown) {
    logger.error('Error in getMyContentLog controller: ', error);
    return reply.status(500).send({
      message: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

// Get all content logs for the current user within a course
export async function getMyProgressForCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      courseId: z.string().transform((v) => Number(v)),
    });

    const paramsResult = paramsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({ message: 'Invalid course ID' });
    }

    const userId = (request.user as { userId: number })?.userId;

    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { courseId } = paramsResult.data;

    const [logs, summary] = await Promise.all([
      getContentLogsByUserAndCourse(userId, courseId),
      getCourseProgressSummary(userId, courseId),
    ]);

    return reply.status(200).send({ logs, summary });
  } catch (error: unknown) {
    logger.error('Error in getMyProgressForCourse controller: ', error);
    return reply.status(500).send({
      message: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}
