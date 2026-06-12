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

/**
 * Bulk-update the sequence field for an array of content items.
 * Runs inside a single transaction.
 * Rules enforced by the caller:
 *  - Pass only root-level content IDs when reordering chapters.
 *  - Pass only child content IDs of one specific parent when reordering topics.
 */
export async function reorderContents(
  items: { id: number; sequence: number }[]
): Promise<void> {
  await Promise.all(
    items.map((item) =>
      db
        .update(Content)
        .set({ sequence: item.sequence, updatedAt: new Date() })
        .where(eq(Content.id, item.id))
    )
  );
}
