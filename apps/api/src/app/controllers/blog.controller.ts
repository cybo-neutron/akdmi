import { FastifyReply, FastifyRequest } from 'fastify';
import {
  createBlog as createBlogRepo,
  getBlogById as getBlogByIdRepo,
  getAllBlogs as getAllBlogsRepo,
  updateBlog as updateBlogRepo,
  deleteBlog as deleteBlogRepo,
} from '@org/database/repo';
import z from 'zod';
import { logger } from '@org/utils';

// Create blog
export async function createNewBlog(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const blogSchema = z.object({
      title: z.string().min(1).max(500),
      content: z.string().min(1),
    });

    const result = blogSchema.safeParse(request.body);

    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { title, content } = result.data;
    const authorId = Number(request.user.userId);

    const blog = await createBlogRepo({ title, content, authorId });

    return reply.status(201).send(blog);
  } catch (error: any) {
    logger.error('Error in createNewBlog controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Get blog by id
export async function getBlogById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const result = paramsSchema.safeParse(request.params);

    if (!result.success) {
      return reply.status(400).send({ message: 'Invalid blog ID' });
    }

    const { id } = result.data;
    const blog = await getBlogByIdRepo(id);

    if (!blog) {
      return reply.status(404).send({ message: 'Blog not found' });
    }

    return reply.status(200).send(blog);
  } catch (error: any) {
    logger.error('Error in getBlogById controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Get all blogs (paginated)
export async function getAllBlogs(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 1)),
      limit: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 10)),
      search: z.string().optional(),
    });

    const queryResult = querySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({ message: 'Invalid query parameters' });
    }

    const { page, limit, search } = queryResult.data;
    const result = await getAllBlogsRepo({ page, limit, search });

    return reply.status(200).send(result);
  } catch (error: any) {
    logger.error('Error in getAllBlogs controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Update blog
export async function updateExistingBlog(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const blogSchema = z.object({
      title: z.string().min(1).max(500).optional(),
      content: z.string().min(1).optional(),
    });

    const paramsResult = paramsSchema.safeParse(request.params);
    const bodyResult = blogSchema.safeParse(request.body);

    if (!paramsResult.success || !bodyResult.success) {
      return reply.status(400).send({ message: 'Invalid data' });
    }

    const { id } = paramsResult.data;
    const updatedBlog = await updateBlogRepo(id, bodyResult.data);

    if (!updatedBlog) {
      return reply.status(404).send({ message: 'Blog not found' });
    }

    return reply.status(200).send(updatedBlog);
  } catch (error: any) {
    logger.error('Error in updateExistingBlog controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}

// Delete blog
export async function deleteExistingBlog(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const paramsResult = paramsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({ message: 'Invalid blog ID' });
    }

    const { id } = paramsResult.data;
    const deleted = await deleteBlogRepo(id);

    if (!deleted) {
      return reply.status(404).send({ message: 'Blog not found' });
    }

    return reply.status(200).send({ message: 'Blog deleted successfully' });
  } catch (error: any) {
    logger.error('Error in deleteExistingBlog controller: ', error);
    return reply.status(500).send({
      message: error?.message || 'Internal Server Error',
    });
  }
}
