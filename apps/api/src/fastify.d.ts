import { UserSchema } from '@org/database';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserSchema;
  }
}
