import { createRoleResourcePermission, db } from '@org/database';

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
      student: [Action.read],
      mentor: [Action.read, Action.create, Action.update, Action.delete],
      admin: [Action.read, Action.create, Action.update, Action.delete],
    },
    content: {
      student: [Action.read],
      mentor: [Action.read, Action.create, Action.update, Action.delete],
      admin: [Action.read, Action.create, Action.update, Action.delete],
    },
    user: {
      mentor: [Action.read, Action.create, Action.update, Action.delete],
      admin: [Action.read, Action.create, Action.update, Action.delete],
    },
  };

  for (const [resource, roleWitPermissions] of Object.entries(data)) {
    for (const [role, permissions] of Object.entries(roleWitPermissions)) {
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

      await createRoleResourcePermission({
        role: role as any,
        resource: resource as any,
        permission: actionPermissionObj,
      });
    }
  }
}

script();
