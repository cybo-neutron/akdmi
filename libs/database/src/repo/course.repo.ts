import { db } from '../db';
import {
  Course,
  CourseInsertType,
  CourseSelectType,
} from '../schema/course.schema';
import { and, eq } from 'drizzle-orm';

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
): Promise<CourseSelectType | null> {
  const [course] = await db
    .select()
    .from(Course)
    .where(eq(Course.id, id))
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
