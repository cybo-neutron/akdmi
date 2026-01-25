import { db } from '../db';
import {
  ContentText,
  ContentTextInsertType,
  ContentTextSelectType,
} from '../schema/content_text.schema';
import { eq } from 'drizzle-orm';

export async function createContentText(
  data: ContentTextInsertType
): Promise<ContentTextSelectType> {
  const [newText] = await db.insert(ContentText).values(data).returning();
  return newText;
}

export async function updateContentTextByContentId(
  contentId: number,
  data: Partial<ContentTextInsertType>
): Promise<ContentTextSelectType | null> {
  const [updated] = await db
    .update(ContentText)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ContentText.contentId, contentId))
    .returning();
  return updated || null;
}

export async function getContentTextByContentId(
  contentId: number
): Promise<ContentTextSelectType | null> {
  const [text] = await db
    .select()
    .from(ContentText)
    .where(eq(ContentText.contentId, contentId))
    .limit(1);
  return text || null;
}
