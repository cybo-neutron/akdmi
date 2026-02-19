import { db } from '../db';
import { Blog, BlogInsertType, BlogSelectType } from '../schema/blog.schema';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { User } from '../schema/user.schema';

// Create blog
export async function createBlog(
  blogData: BlogInsertType
): Promise<BlogSelectType> {
  const [blog] = await db.insert(Blog).values(blogData).returning();
  return blog;
}

// Get blog by id (with author details)
export async function getBlogById(id: number) {
  const [blog] = await db
    .select({
      blog: Blog,
      author: {
        id: User.id,
        firstName: User.firstName,
        lastName: User.lastName,
        email: User.email,
        avatarUrl: User.avatarUrl,
      },
    })
    .from(Blog)
    .innerJoin(User, eq(Blog.authorId, User.id))
    .where(eq(Blog.id, id))
    .limit(1);
  return blog || null;
}

// Get all blogs (paginated with search)
export interface PaginatedBlogsParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedBlogsResult {
  blogs: Array<{
    blog: BlogSelectType;
    author: {
      id: number;
      firstName: string | null;
      lastName: string | null;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAllBlogs(
  params: PaginatedBlogsParams
): Promise<PaginatedBlogsResult> {
  const { page, limit, search } = params;
  const offset = (page - 1) * limit;

  const searchCondition = search
    ? or(ilike(Blog.title, `%${search}%`), ilike(Blog.content, `%${search}%`))
    : undefined;

  const [blogs, countResult] = await Promise.all([
    db
      .select({
        blog: Blog,
        author: {
          id: User.id,
          firstName: User.firstName,
          lastName: User.lastName,
          email: User.email,
          avatarUrl: User.avatarUrl,
        },
      })
      .from(Blog)
      .innerJoin(User, eq(Blog.authorId, User.id))
      .where(searchCondition)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(Blog)
      .where(searchCondition),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    blogs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Update blog
export async function updateBlog(
  id: number,
  blogData: Partial<BlogInsertType>
): Promise<BlogSelectType | null> {
  const [blog] = await db
    .update(Blog)
    .set({
      ...blogData,
      updatedAt: new Date(),
    })
    .where(eq(Blog.id, id))
    .returning();
  return blog || null;
}

// Delete blog
export async function deleteBlog(id: number): Promise<boolean> {
  const result = await db.delete(Blog).where(eq(Blog.id, id)).returning();
  return result.length > 0;
}
