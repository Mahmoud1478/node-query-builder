export type PaginateOptions = {
    perPage: number | 10;
    page: number | 1;
};
export type PaginateQueries = {
    count: {
        string: string;
        values: (number | string)[];
    };
    query: {
        string: string;
        values: (number | string)[];
    };
};
export type PaginateRetuen<type> = {
    count: number;
    currentPage: number;
    perPage: number;
    data: type[];
    pageCount: number;
};

export type Filters = {
    where: Record<string, string | number>;
    or?: Record<string, string | number>;
};
