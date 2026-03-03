import type { z } from 'zod';

export function parseJsonb<T>(schema: z.ZodType<T>, json: unknown, label: string): T {
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new Error(`Invalid ${label}: ${result.error.message}`);
  }
  return result.data;
}
