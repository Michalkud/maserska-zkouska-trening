import type { Storage } from "./types";

// Ternary + require() (not static import): Next.js inlines NEXT_PUBLIC_STORAGE
// at build time, so the bundler DCEs the unused branch. A static import of
// @/lib/storage/prisma would pull PrismaClient into the client bundle because
// @/lib/db instantiates it at module load.
const storageImpl: Storage =
  process.env.NEXT_PUBLIC_STORAGE === "localstorage"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("./localstorage") as typeof import("./localstorage"))
        .localStorageStorage
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("./prisma") as typeof import("./prisma")).prismaStorage;

export const storage: Storage = storageImpl;

export * from "./types";
