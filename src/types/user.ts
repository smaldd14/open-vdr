export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export type UserRole = 'admin' | 'viewer';
