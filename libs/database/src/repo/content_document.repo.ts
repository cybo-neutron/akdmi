import { db } from '../db';
import {
  ContentDocument,
  ContentDocumentInsertType,
  ContentDocumentSelectType,
} from '../schema/content_document.schema';
import { eq } from 'drizzle-orm';

export async function createContentDocument(
  data: ContentDocumentInsertType
): Promise<ContentDocumentSelectType> {
  const [newDoc] = await db.insert(ContentDocument).values(data).returning();
  return newDoc;
}

export async function updateContentDocumentByContentId(
  contentId: number,
  data: Partial<ContentDocumentInsertType>
): Promise<ContentDocumentSelectType | null> {
  const [updated] = await db
    .update(ContentDocument)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ContentDocument.contentId, contentId))
    .returning();
  return updated || null;
}

export async function getContentDocumentByContentId(
  contentId: number
): Promise<ContentDocumentSelectType | null> {
  const [doc] = await db
    .select()
    .from(ContentDocument)
    .where(eq(ContentDocument.contentId, contentId))
    .limit(1);
  return doc || null;
}

export async function deleteContentDocumentByContentId(
  contentId: number
): Promise<void> {
  await db
    .delete(ContentDocument)
    .where(eq(ContentDocument.contentId, contentId));
}
