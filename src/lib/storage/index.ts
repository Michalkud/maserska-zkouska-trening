import { prismaStorage } from "./prisma";
import type { Storage } from "./types";

export const storage: Storage = prismaStorage;

export * from "./types";
