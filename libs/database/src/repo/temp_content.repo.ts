import { db } from '../db';
import {
  TempContent,
  TempContentInsertType,
  TempContentSelectType,
  ProcessingStatusEnum,
} from '../schema/temp_content.schema';
import { eq } from 'drizzle-orm';

// --- TempContent Repository Functions ---

export async function createTempContent(
  data: TempContentInsertType
): Promise<TempContentSelectType> {
  const [newTempContent] = await db
    .insert(TempContent)
    .values(data)
    .returning();
  return newTempContent;
}

export async function getTempContentById(
  id: number
): Promise<TempContentSelectType | null> {
  const [tempContent] = await db
    .select()
    .from(TempContent)
    .where(eq(TempContent.id, id))
    .limit(1);
  return tempContent || null;
}

export async function getTempContentByContentId(
  contentId: number
): Promise<TempContentSelectType | null> {
  const [tempContent] = await db
    .select()
    .from(TempContent)
    .where(eq(TempContent.contentId, contentId))
    .limit(1);
  return tempContent || null;
}

export async function updateTempContentStatus(
  id: number,
  status: (typeof ProcessingStatusEnum)[keyof typeof ProcessingStatusEnum]
): Promise<TempContentSelectType | null> {
  const [updated] = await db
    .update(TempContent)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(TempContent.id, id))
    .returning();
  return updated || null;
}

export async function updateTempContent(
  id: number,
  data: Partial<TempContentInsertType>
): Promise<TempContentSelectType | null> {
  const [updated] = await db
    .update(TempContent)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(TempContent.id, id))
    .returning();
  return updated || null;
}

export async function deleteTempContent(id: number): Promise<void> {
  await db.delete(TempContent).where(eq(TempContent.id, id));
}

export async function deleteTempContentByContentId(
  contentId: number
): Promise<void> {
  await db.delete(TempContent).where(eq(TempContent.contentId, contentId));
}
