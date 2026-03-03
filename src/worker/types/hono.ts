import type { User } from '@/types';

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    roomId: string;
  }
}
