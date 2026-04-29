import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function searchPathOption(url: string): string | undefined {
  const m = url.match(/[?&]schema=([^&]+)/);
  const schema = m?.[1] ? decodeURIComponent(m[1]) : "";
  if (schema && schema !== "public") {
    return `-c search_path=${schema},public`;
  }
  return undefined;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool =
    globalForPrisma.pool ??
    new pg.Pool({
      connectionString: url,
      max: 10,
      options: searchPathOption(url),
    });
  globalForPrisma.pool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver) as unknown;
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
