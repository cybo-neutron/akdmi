import { FastifyReply, FastifyRequest } from 'fastify';
import {
  enrollUser as enrollUserRepo,
  unenrollUser as unenrollUserRepo,
  getEnrollment as getEnrollmentRepo,
  getEnrollmentsByUser as getEnrollmentsByUserRepo,
  getEnrollmentsByCursePaginated,
} from '@org/database/repo';
import z from 'zod';
import { logger } from '@org/utils';

// Self-enroll the authenticated user in a course
export async function selfEnrollInCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const bodySchema = z.object({
      courseId: z.number(),
    });

    const result = bodySchema.safeParse(request.body);
    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const userId = Number((request.user as any).userId);
    const { courseId } = result.data;

    // Return 409 if already enrolled (frontend treats this as success)
    const existing = await getEnrollmentRepo(userId, courseId);
    if (existing) {
      return reply
        .status(409)
        .send({ message: 'Already enrolled in this course' });
    }

    const enrollment = await enrollUserRepo({ userId, courseId });
    return reply.status(201).send(enrollment);
  } catch (error: any) {
    logger.error('Error in selfEnrollInCourse: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Check whether the authenticated user is enrolled in a given course
export async function checkMyEnrollment(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      courseId: z.string().transform((v) => Number(v)),
    });

    const result = paramsSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({ message: 'Invalid course ID' });
    }

    const userId = Number((request.user as any).userId);
    const enrollment = await getEnrollmentRepo(userId, result.data.courseId);
    return reply
      .status(200)
      .send({ isEnrolled: !!enrollment, enrollment: enrollment ?? null });
  } catch (error: any) {
    logger.error('Error in checkMyEnrollment: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Enroll a user in a course
export async function enrollUserInCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const bodySchema = z.object({
      userId: z.number(),
      courseId: z.number(),
    });

    const result = bodySchema.safeParse(request.body);

    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { userId, courseId } = result.data;

    // Check if already enrolled
    const existingEnrollment = await getEnrollmentRepo(userId, courseId);
    if (existingEnrollment) {
      return reply
        .status(409)
        .send({ message: 'User is already enrolled in this course' });
    }

    const enrollment = await enrollUserRepo({ userId, courseId });

    return reply.status(201).send(enrollment);
  } catch (error: any) {
    logger.error('Error in enrollUserInCourse controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Unenroll a user from a course
export async function unenrollUserFromCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const bodySchema = z.object({
      userId: z.number(),
      courseId: z.number(),
    });

    const result = bodySchema.safeParse(request.body);

    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { userId, courseId } = result.data;

    const deleted = await unenrollUserRepo(userId, courseId);

    if (!deleted) {
      return reply.status(404).send({ message: 'Enrollment not found' });
    }

    return reply.status(200).send({ message: 'User unenrolled successfully' });
  } catch (error: any) {
    logger.error('Error in unenrollUserFromCourse controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Get all enrollments for the current user
export async function getMyEnrollments(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request.user as any)?.userId;

    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const enrollments = await getEnrollmentsByUserRepo(userId);

    return reply.status(200).send(enrollments);
  } catch (error: any) {
    logger.error('Error in getMyEnrollments controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Get all enrolled users for a course (paginated)
export async function getEnrolledUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      courseId: z.string().transform((v) => Number(v)),
    });

    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 1)),
      limit: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 10)),
    });

    const paramsResult = paramsSchema.safeParse(request.params);
    const queryResult = querySchema.safeParse(request.query);

    if (!paramsResult.success || !queryResult.success) {
      return reply.status(400).send({ message: 'Invalid parameters' });
    }

    const { courseId } = paramsResult.data;
    const { page, limit } = queryResult.data;

    const result = await getEnrollmentsByCursePaginated(courseId, page, limit);

    return reply.status(200).send(result);
  } catch (error: any) {
    logger.error('Error in getEnrolledUsers controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}
