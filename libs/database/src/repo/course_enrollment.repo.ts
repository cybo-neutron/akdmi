import { db } from '../db';
import {
  CourseEnrollment,
  CourseEnrollmentInsertType,
  CourseEnrollmentSelectType,
} from '../schema/course_enrollment.schema';
import { User } from '../schema/user.schema';
import { Course } from '../schema/course.schema';
import { and, eq, sql } from 'drizzle-orm';

// Enroll a user in a course
export async function enrollUser(
  data: CourseEnrollmentInsertType
): Promise<CourseEnrollmentSelectType> {
  const [enrollment] = await db
    .insert(CourseEnrollment)
    .values(data)
    .returning();
  return enrollment;
}

// Unenroll a user from a course
export async function unenrollUser(
  userId: number,
  courseId: number
): Promise<boolean> {
  const result = await db
    .delete(CourseEnrollment)
    .where(
      and(
        eq(CourseEnrollment.userId, userId),
        eq(CourseEnrollment.courseId, courseId)
      )
    )
    .returning();
  return result.length > 0;
}

// Get enrollment by user and course
export async function getEnrollment(
  userId: number,
  courseId: number
): Promise<CourseEnrollmentSelectType | null> {
  const [enrollment] = await db
    .select()
    .from(CourseEnrollment)
    .where(
      and(
        eq(CourseEnrollment.userId, userId),
        eq(CourseEnrollment.courseId, courseId)
      )
    )
    .limit(1);
  return enrollment || null;
}

// Get all enrollments for a user (with course details)
export async function getEnrollmentsByUser(userId: number) {
  return db
    .select({
      enrollment: CourseEnrollment,
      course: Course,
    })
    .from(CourseEnrollment)
    .innerJoin(Course, eq(CourseEnrollment.courseId, Course.id))
    .where(eq(CourseEnrollment.userId, userId));
}

// Get all enrollments for a course (with user details)
export async function getEnrollmentsByCourse(courseId: number) {
  return db
    .select({
      enrollment: CourseEnrollment,
      user: {
        id: User.id,
        firstName: User.firstName,
        lastName: User.lastName,
        email: User.email,
        role: User.role,
        avatarUrl: User.avatarUrl,
      },
    })
    .from(CourseEnrollment)
    .innerJoin(User, eq(CourseEnrollment.userId, User.id))
    .where(eq(CourseEnrollment.courseId, courseId));
}

// Get paginated enrollments for a course
export async function getEnrollmentsByCursePaginated(
  courseId: number,
  page: number,
  limit: number
) {
  const offset = (page - 1) * limit;

  const [enrollments, countResult] = await Promise.all([
    db
      .select({
        enrollment: CourseEnrollment,
        user: {
          id: User.id,
          firstName: User.firstName,
          lastName: User.lastName,
          email: User.email,
          role: User.role,
          avatarUrl: User.avatarUrl,
        },
      })
      .from(CourseEnrollment)
      .innerJoin(User, eq(CourseEnrollment.userId, User.id))
      .where(eq(CourseEnrollment.courseId, courseId))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(CourseEnrollment)
      .where(eq(CourseEnrollment.courseId, courseId)),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    enrollments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
