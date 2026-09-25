export interface Env {
  port: number;
  host: string;
  upstreamApiUrl: string;
}

export function loadEnv(): Env {
  return {
    port: Number(process.env.PORT ?? 3001),
    host: process.env.HOST ?? "0.0.0.0",
    upstreamApiUrl: process.env.UPSTREAM_API_URL ?? "https://rickandmortyapi.com/api",
  };
}
