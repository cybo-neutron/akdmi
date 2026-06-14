import { User, UserSchema } from '../schema/user.schema';
import { db } from '../db';
import {
  Course,
  CourseInsertType,
  CourseSelectType,
} from '../schema/course.schema';
import { and, eq, SQL, sql } from 'drizzle-orm';

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
      status: Course.status,
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

export async function getAllCourses(conditions: Partial<CourseSelectType>): Promise<CourseSelectType[]> {

  const whereCondition: SQL[] = []

  for (const [key, value] of Object.entries(conditions) as [keyof CourseSelectType, any][]) {
    if (value !== undefined) {
      whereCondition.push(eq(Course[key], value));
    }
  }

  return db.select().from(Course).where(
    and(
      ...whereCondition
    )
  );
}

export async function getCoursesWithAuthor({ courseConditions, authorConditions }: { courseConditions: Partial<CourseSelectType>, authorConditions?: Partial<UserSchema> }) {
  const whereCondition: SQL[] = []

  for (const [key, value] of Object.entries(courseConditions) as [keyof CourseSelectType, any][]) {
    if (value !== undefined) {
      whereCondition.push(eq(Course[key], value));
    }
  }
  if (authorConditions) {
    for (const [key, value] of Object.entries(authorConditions) as [keyof UserSchema, any][]) {
      if (value !== undefined) {
        whereCondition.push(eq(User[key], value));
      }
    }
  }

  return db
    .select({
      id: Course.id,
      title: Course.title,
      description: Course.description,
      coverArt: Course.coverArt,
      introductionVideo: Course.introductionVideo,
      isActive: Course.isActive,
      status: Course.status,
      createdBy: Course.createdBy,
      lastUpdatedBy: Course.lastUpdatedBy,
      createdAt: Course.createdAt,
      updatedAt: Course.updatedAt,
      author: sql<string>`concat(${User.firstName}, ' ', ${User.lastName})`,
    })
    .from(Course)
    .innerJoin(User, eq(User.id, Course.createdBy))
    .where(and(
      ...whereCondition
    ));
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
