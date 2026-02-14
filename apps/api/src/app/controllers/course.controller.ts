import { FastifyReply, FastifyRequest } from 'fastify';
import {
  createCourse,
  getAllCourses as getAllCoursesRepo,
  updateCourse as updateCourseRepo,
  deleteCourse as deleteCourseRepo,
  getCourseById as getCourseByIdRepo,
} from '@org/database/repo';
import z from 'zod';
import { logger } from '@org/utils';

export async function createNewCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      title: z.string(),
      description: z.string(),
    });

    const validateResult = validateData.safeParse(request.body);

    if (!validateResult.success) {
      return reply.status(400).send({ message: 'Invalid data' });
    }

    const { title, description } = validateResult.data;
    const course = await createCourse({
      title,
      description,
      createdBy: Number(request.user.userId),
      lastUpdatedBy: Number(request.user.userId),
    });
    return reply.status(201).send(course);
  } catch (error: any) {
    logger.error('Error creating course: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

export async function getAllCourses(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const courses = await getAllCoursesRepo();
    return reply.status(200).send(courses);
  } catch (error: any) {
    reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

export async function getCourseById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const validateResult = validateData.safeParse(request.params);

    if (!validateResult.success) {
      logger.error('Invalid data: ', validateResult.error);
      return reply.status(400).send({ message: 'Invalid data' });
    }

    const { id } = validateResult.data;
    const course = await getCourseByIdRepo(id);
    return reply.status(200).send(course);
  } catch (error: any) {
    logger.error('Error getting course: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

export async function updateCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
    });

    const validateResult = validateData.safeParse(request.body);

    if (!validateResult.success) {
      logger.error('Invalid data: ', validateResult.error);
      return reply.status(400).send({ message: 'Invalid data' });
    }

    const { id, title, description } = validateResult.data;
    const course = await updateCourseRepo(id, {
      ...(title && { title }),
      ...(description && { description }),
    });
    return reply.status(200).send(course);
  } catch (error: any) {
    logger.error('Error updating course: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

export async function deleteCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const validateResult = validateData.safeParse(request.params);

    if (!validateResult.success) {
      logger.error('Invalid data: ', validateResult.error);
      return reply.status(400).send({ message: 'Invalid data' });
    }

    const { id } = validateResult.data;
    const course = await deleteCourseRepo(id);
    return reply.status(200).send(course);
  } catch (error: any) {
    logger.error('Error deleting course: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}
