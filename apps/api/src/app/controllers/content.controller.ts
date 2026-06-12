import { FastifyReply, FastifyRequest } from 'fastify';
import {
  createContent as createContentRepo,
  getContentsByCourse as getContentsByCourseRepo,
  getContentById as getContentByIdRepo,
  updateContent as updateContentRepo,
  deleteContent as deleteContentRepo,
  reorderContents as reorderContentsRepo,
  createContentText,
  createContentMedia,
  createContentDocument,
  getContentTextByContentId,
  getContentMediaByContentId,
  getContentDocumentByContentId,
  updateContentTextByContentId,
  updateContentMediaByContentId,
  updateContentDocumentByContentId,
} from '@org/database/repo';
import z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getFileCategory, getFileExtension, logger } from '@org/utils';
import { getSignedDownloadUrl, getSignedUploadUrl } from '@org/aws';

// Create new content (chapter or topic) — base record only
export async function createContent(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const baseSchema = z.object({
      title: z.string().min(1),
      description: z.string(),
      type: z.enum(['text', 'media', 'document']),
      courseId: z.number(),
      parentId: z.number().nullable().optional(),
      sequence: z.number().optional(),
    });

    const baseResult = baseSchema.safeParse(request.body);

    if (!baseResult.success) {
      logger.error('Invalid base data: ', baseResult.error);
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: baseResult.error.issues });
    }

    const { title, description, type, courseId, parentId, sequence } =
      baseResult.data;

    const content = await createContentRepo({
      title,
      description,
      type,
      courseId,
      parentId: parentId || null,
      sequence: sequence || 1,
      createdBy: Number(request.user.userId),
      lastUpdatedBy: Number(request.user.userId),
    });

    return reply.status(201).send(content);
  } catch (error: any) {
    logger.error('Error creating content: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// Get all contents for a course with type-specific data
export async function getContentsByCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      courseId: z.string().transform((v) => Number(v)),
    });

    const validateResult = validateData.safeParse(request.params);

    if (!validateResult.success) {
      logger.error('Invalid courseId: ', validateResult.error);
      return reply.status(400).send({ message: 'Invalid course ID' });
    }

    const { courseId } = validateResult.data;
    const contents = await getContentsByCourseRepo(courseId);

    // Fetch type-specific data for each content
    const contentsWithTypeData = await Promise.all(
      contents.map(async (content) => {
        let typeData = null;
        if (content.type === 'text') {
          typeData = await getContentTextByContentId(content.id);
        } else if (content.type === 'media') {
          typeData = await getContentMediaByContentId(content.id);
        } else if (content.type === 'document') {
          typeData = await getContentDocumentByContentId(content.id);
        }
        return { ...content, typeData };
      })
    );

    return reply.status(200).send(contentsWithTypeData);
  } catch (error: any) {
    logger.error('Error fetching contents: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// Get content by ID with type-specific data
export async function getContentById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const validateResult = validateData.safeParse(request.params);

    if (!validateResult.success) {
      logger.error('Invalid content ID: ', validateResult.error);
      return reply.status(400).send({ message: 'Invalid content ID' });
    }

    const { id } = validateResult.data;
    const content = await getContentByIdRepo(id);

    if (!content) {
      return reply.status(404).send({ message: 'Content not found' });
    }

    // Fetch type-specific data
    let typeData = null;
    if (content.type === 'text') {
      typeData = await getContentTextByContentId(content.id);
    } else if (content.type === 'media') {
      typeData = await getContentMediaByContentId(content.id);

      if (typeData?.url) {
        const [bucket, objectKey] = typeData.url.split('::');

        // const finalObjectKey = `${contentId}::${objectKey}`;

        if (bucket && objectKey) {
          try {
            const url = await getSignedDownloadUrl(bucket, objectKey);
            typeData.url = url as string;
          } catch (error) {
            logger.error('Error generating signed URL: ', error);
          }
        }
      }
    } else if (content.type === 'document') {
      typeData = await getContentDocumentByContentId(content.id);
    }

    return reply.status(200).send({ ...content, typeData });
  } catch (error: any) {
    logger.error('Error fetching content: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// Update base content fields only
export async function updateContent(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(['text', 'media', 'document']).optional(),
      sequence: z.number().optional(),
    });

    const validateResult = validateData.safeParse(request.body);

    if (!validateResult.success) {
      logger.error('Invalid data: ', validateResult.error);
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: validateResult.error.issues });
    }

    const { id, title, description, type, sequence } = validateResult.data;

    const content = await updateContentRepo(id, {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(type && { type }),
      ...(sequence !== undefined && { sequence }),
      lastUpdatedBy: Number(request.user.userId),
    });

    if (!content) {
      return reply.status(404).send({ message: 'Content not found' });
    }

    return reply.status(200).send(content);
  } catch (error: any) {
    logger.error('Error updating content: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// Delete content (soft delete)
export async function deleteContent(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validateData = z.object({
      id: z.string().transform((v) => Number(v)),
    });

    const validateResult = validateData.safeParse(request.params);

    if (!validateResult.success) {
      logger.error('Invalid content ID: ', validateResult.error);
      return reply.status(400).send({ message: 'Invalid content ID' });
    }

    const { id } = validateResult.data;
    await deleteContentRepo(id);

    return reply.status(200).send({ message: 'Content deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting content: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// Bulk-reorder content sequence numbers
export async function reorderContents(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const schema = z.object({
      items: z
        .array(z.object({ id: z.number(), sequence: z.number() }))
        .min(1),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      logger.error('Invalid reorder data: ', result.error);
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    await reorderContentsRepo(result.data.items);
    return reply.status(200).send({ message: 'Reordered successfully' });
  } catch (error: any) {
    logger.error('Error reordering contents: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// ─── Type-Specific Content CRUD ────────────────────────────────────────

// Save (create or update) text content for a given content ID
export async function saveContentText(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const schema = z.object({
      contentId: z.number(),
      content: z.string().min(1),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { contentId, content: textContent } = result.data;

    // Check if text data already exists — update or create
    const existing = await getContentTextByContentId(contentId);
    let typeData;

    if (existing) {
      typeData = await updateContentTextByContentId(contentId, {
        content: textContent,
      });
    } else {
      typeData = await createContentText({
        contentId,
        content: textContent,
      });
    }

    return reply.status(200).send(typeData);
  } catch (error: any) {
    logger.error('Error saving content text: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// Save (create or update) media content for a given content ID
export async function saveContentMedia(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const schema = z.object({
      contentId: z.number(),
      url: z.string().url(),
      mediaType: z.enum(['video', 'audio', 'image']),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { contentId, url, mediaType } = result.data;

    const existing = await getContentMediaByContentId(contentId);
    let typeData;

    if (existing) {
      typeData = await updateContentMediaByContentId(contentId, {
        url,
        type: mediaType,
      });
    } else {
      typeData = await createContentMedia({
        contentId,
        url,
        type: mediaType,
      });
    }

    return reply.status(200).send(typeData);
  } catch (error: any) {
    logger.error('Error saving content media: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

export async function getContentMediaPresignedUrlForUpload(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const schema = z.object({
      name: z.string(),
      contentType: z.string(),
      contentId: z.number(),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { name, contentType, contentId } = result.data;

    const extension = getFileExtension(name);

    const bucketName = process.env.AWS_CONTENT_TEMPORARY_BUCKET as string;
    if (!bucketName) {
      throw Error('bucket name empty');
    }
    const fileCategory = getFileCategory(contentType);

    const objectKey = `${fileCategory}/${contentId}_${uuidv4()}.${extension}`;

    const signedUrl = await getSignedUploadUrl(
      bucketName,
      objectKey,
      contentType
    );

    return reply.status(200).send({
      signedUrl,
      bucketName,
      objectKey,
      fileCategory,
    });
  } catch (error: any) {
    logger.error(
      'Error getting content media presigned url for upload: ',
      error
    );
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}

// Save (create or update) document content for a given content ID
export async function saveContentDocument(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const schema = z.object({
      contentId: z.number(),
      url: z.string().url(),
      documentType: z.enum(['pdf', 'doc', 'ppt', 'other']),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid data', errors: result.error.issues });
    }

    const { contentId, url, documentType } = result.data;

    const existing = await getContentDocumentByContentId(contentId);
    let typeData;

    if (existing) {
      typeData = await updateContentDocumentByContentId(contentId, {
        url,
        type: documentType,
      });
    } else {
      typeData = await createContentDocument({
        contentId,
        url,
        type: documentType,
      });
    }

    return reply.status(200).send(typeData);
  } catch (error: any) {
    logger.error('Error saving content document: ', error);
    return reply
      .status(500)
      .send({ message: error?.message || 'Internal Server Error' });
  }
}
