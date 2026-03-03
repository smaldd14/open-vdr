export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T> {
    pagination?: {
        total: number;
        limit: number;
        offset: number;
    };
}
