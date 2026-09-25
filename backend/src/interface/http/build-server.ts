import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { buildDependencies } from "../../composition/dependencies.js";
import { loadEnv, type Env } from "../../config/env.js";
import { episodesRoute } from "./routes/episodes.route.js";
import { healthRoute } from "./routes/health.route.js";

export async function buildServer(env: Env = loadEnv()): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  const dependencies = buildDependencies(env);

  await app.register(cors, { origin: true });
  await app.register(healthRoute);
  await app.register(episodesRoute, dependencies);

  return app;
}
