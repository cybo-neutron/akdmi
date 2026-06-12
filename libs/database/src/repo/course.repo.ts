import { User } from '../schema/user.schema';
import { db } from '../db';
import {
  Course,
  CourseInsertType,
  CourseSelectType,
} from '../schema/course.schema';
import { and, eq, sql } from 'drizzle-orm';

export async function createCourse(
  courseData: CourseInsertType
): Promise<CourseSelectType> {
  const [newCourse] = await db.insert(Course).values(courseData).returning();
  return newCourse;
}

export async function updateCourse(
  id: number,
  courseData: Partial<CourseInsertType>
): Promise<CourseSelectType | null> {
  const [updatedCourse] = await db
    .update(Course)
    .set({
      ...courseData,
      updatedAt: new Date(),
    })
    .where(eq(Course.id, id))
    .returning();
  return updatedCourse || null;
}

export async function getCourseById(
  id: number
): Promise<(CourseSelectType & { author?: string | null }) | null> {
  const [course] = await db
    .select({
      id: Course.id,
      title: Course.title,
      description: Course.description,
      coverArt: Course.coverArt,
      introductionVideo: Course.introductionVideo,
      isActive: Course.isActive,
      createdBy: Course.createdBy,
      lastUpdatedBy: Course.lastUpdatedBy,
      createdAt: Course.createdAt,
      updatedAt: Course.updatedAt,
      author: sql<string>`concat(${User.firstName}, ' ', ${User.lastName})`,
    })
    .from(Course)
    .where(eq(Course.id, id))
    .innerJoin(User, eq(User.id, Course.createdBy))
    .limit(1);
  return course || null;
}

export async function getCoursesByUser(
  userId: number
): Promise<CourseSelectType[]> {
  return db
    .select()
    .from(Course)
    .where(and(eq(Course.createdBy, userId), eq(Course.isActive, true)));
}

export async function getAllCourses(): Promise<CourseSelectType[]> {
  return db.select().from(Course).where(eq(Course.isActive, true));
}

export async function deleteCourse(id: number): Promise<void> {
  await db
    .update(Course)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(Course.id, id));
}
