import { db } from '../db';
import {
  UserContentLog,
  UserContentLogInsertType,
  UserContentLogSelectType,
  CompletionStatusEnum,
} from '../schema/user_content_log.schema';
import { Content } from '../schema/content.schema';
import { and, eq, sql } from 'drizzle-orm';

// Create a new log entry when a user first opens a content item
export async function createUserContentLog(
  data: UserContentLogInsertType
): Promise<UserContentLogSelectType> {
  const [log] = await db.insert(UserContentLog).values(data).returning();
  return log;
}

// Upsert — create if not exists, otherwise update completionStatus
export async function upsertUserContentLog(
  userId: number,
  contentId: number,
  completionStatus: (typeof CompletionStatusEnum)[keyof typeof CompletionStatusEnum]
): Promise<UserContentLogSelectType> {
  const [log] = await db
    .insert(UserContentLog)
    .values({ userId, contentId, completionStatus })
    .onConflictDoUpdate({
      target: [UserContentLog.userId, UserContentLog.contentId],
      set: {
        completionStatus,
        updatedAt: new Date(),
      },
    })
    .returning();
  return log;
}

// Get log for a specific user + content pair
export async function getUserContentLog(
  userId: number,
  contentId: number
): Promise<UserContentLogSelectType | null> {
  const [log] = await db
    .select()
    .from(UserContentLog)
    .where(
      and(
        eq(UserContentLog.userId, userId),
        eq(UserContentLog.contentId, contentId)
      )
    )
    .limit(1);
  return log || null;
}

// Get all content logs for a user (with content details)
export async function getContentLogsByUser(userId: number) {
  return db
    .select({
      log: UserContentLog,
      content: {
        id: Content.id,
        title: Content.title,
        type: Content.type,
        sequence: Content.sequence,
        courseId: Content.courseId,
        parentId: Content.parentId,
      },
    })
    .from(UserContentLog)
    .innerJoin(Content, eq(UserContentLog.contentId, Content.id))
    .where(eq(UserContentLog.userId, userId));
}

// Get all content logs for a user within a specific course
export async function getContentLogsByUserAndCourse(
  userId: number,
  courseId: number
) {
  return db
    .select({
      ...UserContentLog,
      // content: {
      //   id: Content.id,
      //   title: Content.title,
      //   type: Content.type,
      //   sequence: Content.sequence,
      //   parentId: Content.parentId,
      // },
    })
    .from(UserContentLog)
    .innerJoin(Content, eq(UserContentLog.contentId, Content.id))
    .where(
      and(
        eq(UserContentLog.userId, userId),
        eq(Content.courseId, courseId)
      )
    );
}

// Get completion summary for a user in a course
export async function getCourseProgressSummary(
  userId: number,
  courseId: number
) {
  const [result] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
      completed: sql<number>`cast(sum(case when ${UserContentLog.completionStatus} = ${CompletionStatusEnum.COMPLETED} then 1 else 0 end) as int)`,
      inProgress: sql<number>`cast(sum(case when ${UserContentLog.completionStatus} = ${CompletionStatusEnum.IN_PROGRESS} then 1 else 0 end) as int)`,
    })
    .from(UserContentLog)
    .innerJoin(Content, eq(UserContentLog.contentId, Content.id))
    .where(
      and(
        eq(UserContentLog.userId, userId),
        eq(Content.courseId, courseId)
      )
    );

  return {
    total: result?.total ?? 0,
    completed: result?.completed ?? 0,
    inProgress: result?.inProgress ?? 0,
    notStarted:
      (result?.total ?? 0) -
      (result?.completed ?? 0) -
      (result?.inProgress ?? 0),
  };
}

// Update completion status for an existing log
export async function updateContentLogStatus(
  userId: number,
  contentId: number,
  completionStatus: (typeof CompletionStatusEnum)[keyof typeof CompletionStatusEnum]
): Promise<UserContentLogSelectType | null> {
  const [updated] = await db
    .update(UserContentLog)
    .set({ completionStatus, updatedAt: new Date() })
    .where(
      and(
        eq(UserContentLog.userId, userId),
        eq(UserContentLog.contentId, contentId)
      )
    )
    .returning();
  return updated || null;
}
