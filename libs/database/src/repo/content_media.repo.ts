import { db } from '../db';
import {
  ContentMedia,
  ContentMediaInsertType,
  ContentMediaSelectType,
} from '../schema/content_media.schema';
import { eq } from 'drizzle-orm';

export async function createContentMedia(
  data: ContentMediaInsertType
): Promise<ContentMediaSelectType> {
  const [newMedia] = await db.insert(ContentMedia).values(data).returning();
  return newMedia;
}

export async function updateContentMediaByContentId(
  contentId: number,
  data: Partial<ContentMediaInsertType>
): Promise<ContentMediaSelectType | null> {
  const [updated] = await db
    .update(ContentMedia)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ContentMedia.contentId, contentId))
    .returning();
  return updated || null;
}

export async function getContentMediaByContentId(
  contentId: number
): Promise<ContentMediaSelectType | null> {
  const [media] = await db
    .select()
    .from(ContentMedia)
    .where(eq(ContentMedia.contentId, contentId))
    .limit(1);
  return media || null;
}
