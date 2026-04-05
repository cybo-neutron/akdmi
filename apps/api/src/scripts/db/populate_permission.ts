import {
  createRoleResourcePermission,
  db,
  getAllRoleResourcePermissions,
  updateRoleResourcePermission,
} from '@org/database';
import { UserRole } from '../../app/constant/UserRoles';

console.log('Database url : ', process.env.DATABASE_URL);

const Action = {
  create: 'create',
  read: 'read',
  update: 'update',
  delete: 'delete',
};

async function script() {
  const data = {
    course: {
      [UserRole.STUDENT]: [Action.read],
      [UserRole.MENTOR]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
      [UserRole.ADMIN]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
      [UserRole.MANAGER]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
    },
    content: {
      [UserRole.STUDENT]: [Action.read],
      [UserRole.MENTOR]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
      [UserRole.ADMIN]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
      [UserRole.MANAGER]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
    },
    user: {
      [UserRole.STUDENT]: [Action.read],
      [UserRole.MENTOR]: [Action.read],
      [UserRole.ADMIN]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
      [UserRole.MANAGER]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
    },
    blog: {
      [UserRole.STUDENT]: [Action.read],
      [UserRole.MENTOR]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
      [UserRole.ADMIN]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
      [UserRole.MANAGER]: [
        Action.read,
        Action.create,
        Action.update,
        Action.delete,
      ],
    },
  };

  const rolePermissions = await getAllRoleResourcePermissions();

  for (const [resource, roleWitPermissions] of Object.entries(data)) {
    for (const [role, permissions] of Object.entries(roleWitPermissions)) {
      const existingPermission = rolePermissions.find(
        (permission) =>
          permission.resource === resource && permission.role === role
      );

      const actionPermissionObj = {
        read: false,
        create: false,
        update: false,
        delete: false,
      };
      for (const permission of permissions) {
        if (permission === Action.read) {
          actionPermissionObj.read = true;
        }
        if (permission === Action.create) {
          actionPermissionObj.create = true;
        }
        if (permission === Action.update) {
          actionPermissionObj.update = true;
        }
        if (permission === Action.delete) {
          actionPermissionObj.delete = true;
        }
      }

      if (existingPermission) {
        await updateRoleResourcePermission(existingPermission.id, {
          permission: actionPermissionObj,
        });
      } else {
        await createRoleResourcePermission({
          role: role as any,
          resource: resource as any,
          permission: actionPermissionObj,
        });
      }
    }
  }
}

script();
