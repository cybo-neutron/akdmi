import { FastifyInstance } from "fastify"

export const userRoutes = (fastify: FastifyInstance, done: any) => {
    fastify.get("/", async function () {
        return { message: 'Hello users' };
    });


}