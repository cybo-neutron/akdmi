import { bigserial, pgEnum, pgTable } from 'drizzle-orm/pg-core';
import { timestamps } from '../lib/timestamps';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';
import { UserRole } from './user.schema';

const PermissionEnumType = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

const ResourceEnumType = {
  USER: 'user',
  CONTENT: 'content',
  COURSE: 'course',
} as const;

export const PermissionEnum = pgEnum(
  'permission',
  Object.values(PermissionEnumType) as [string, ...string[]]
);

export const ResourceEnum = pgEnum(
  'resource',
  Object.values(ResourceEnumType) as [string, ...string[]]
);

export const RoleResourcePermission = pgTable('role_resource_permission', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  role: UserRole('role').notNull(),
  resource: ResourceEnum('resource').notNull(),
  permission: PermissionEnum('permission').notNull(),
  ...timestamps,
});

export const RoleResourcePermissionSchema = createSelectSchema(
  RoleResourcePermission
);
export const RoleResourcePermissionInsertSchema = createInsertSchema(
  RoleResourcePermission
);

export type RoleResourcePermissionSelectType = z.infer<
  typeof RoleResourcePermissionSchema
>;
export type RoleResourcePermissionInsertType = z.infer<
  typeof RoleResourcePermissionInsertSchema
>;
