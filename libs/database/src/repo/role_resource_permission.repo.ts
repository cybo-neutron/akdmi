import { db } from '../db';
import {
  RoleResourcePermission,
  RoleResourcePermissionInsertType,
  RoleResourcePermissionSelectType,
} from '../schema/role_resource_permission';
import { eq } from 'drizzle-orm';

export async function createRoleResourcePermission(
  data: RoleResourcePermissionInsertType
): Promise<RoleResourcePermissionSelectType> {
  const [newPermission] = await db
    .insert(RoleResourcePermission)
    .values(data)
    .returning();
  return newPermission;
}

export async function getRoleResourcePermissionById(
  id: number
): Promise<RoleResourcePermissionSelectType | null> {
  const [permission] = await db
    .select()
    .from(RoleResourcePermission)
    .where(eq(RoleResourcePermission.id, id))
    .limit(1);
  return permission || null;
}

export async function getAllRoleResourcePermissions(): Promise<
  RoleResourcePermissionSelectType[]
> {
  return db.select().from(RoleResourcePermission);
}

export async function updateRoleResourcePermission(
  id: number,
  data: Partial<RoleResourcePermissionInsertType>
): Promise<RoleResourcePermissionSelectType | null> {
  const [updated] = await db
    .update(RoleResourcePermission)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(RoleResourcePermission.id, id))
    .returning();
  return updated || null;
}

export async function deleteRoleResourcePermission(id: number): Promise<void> {
  await db
    .delete(RoleResourcePermission)
    .where(eq(RoleResourcePermission.id, id));
}
