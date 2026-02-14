import { db } from '../db';
import {
  Content,
  ContentInsertType,
  ContentSelectType,
} from '../schema/content.schema';
import { and, eq, asc } from 'drizzle-orm';

// --- Content Base Functions ---

export async function createContent(
  contentData: ContentInsertType
): Promise<ContentSelectType> {
  const [newContent] = await db.insert(Content).values(contentData).returning();
  return newContent;
}

export async function updateContent(
  id: number,
  contentData: Partial<ContentInsertType>
): Promise<ContentSelectType | null> {
  const [updatedContent] = await db
    .update(Content)
    .set({
      ...contentData,
      updatedAt: new Date(),
    })
    .where(eq(Content.id, id))
    .returning();
  return updatedContent || null;
}

export async function getContentById(
  id: number
): Promise<ContentSelectType | null> {
  const [content] = await db
    .select()
    .from(Content)
    .where(eq(Content.id, id))
    .limit(1);
  return content || null;
}

export async function getContentsByUser(
  userId: number
): Promise<ContentSelectType[]> {
  return db
    .select()
    .from(Content)
    .where(and(eq(Content.createdBy, userId), eq(Content.isActive, true)));
}

export async function getContentsByCourse(
  courseId: number
): Promise<ContentSelectType[]> {
  return db
    .select()
    .from(Content)
    .where(and(eq(Content.courseId, courseId), eq(Content.isActive, true)))
    .orderBy(asc(Content.sequence));
}

export async function deleteContent(id: number): Promise<void> {
  // First, soft delete all child content (topics under this chapter)
  await db
    .update(Content)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(Content.parentId, id));

  // Then soft delete the content itself
  await db
    .update(Content)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(Content.id, id));
}
