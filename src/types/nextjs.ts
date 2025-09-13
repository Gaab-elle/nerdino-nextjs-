// Types for Next.js 15 App Router

export type Params<T> = { params: Promise<T> };
export type SearchParams<T = Record<string, string | string[] | undefined>> = { searchParams: Promise<T> };

// Utility type for safe access to optional properties
export function safe<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback;
}

// Utility type for handling nullable Prisma fields
export type PrismaNullable<T> = T | null | undefined;

// Utility type for handling optional Prisma relations
export type PrismaOptional<T> = T | undefined;
