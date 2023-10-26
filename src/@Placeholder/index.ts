const placeholders: Record<string, (iteration: number, key?: string) => string> = {
    /**
     * Returns placeholder for PostgresSql.
     *
     * @param {number} iteration - The iterator to convert to a string.
     * @param {string | null} key - An optional key to include in the string representation.
     * @returns {string} - The string representation of the iterator.
     */
    pg: function (iteration: number, key: string | null = null): string {
        return `$${iteration}`;
    },
    /**
     * returns placeholder for MySql.
     *
     * @param {number} iteration - the number of iterations to perform
     * @param {string | null} key - the key to use for the query, defaults to null
     * @return {string} - the result of the query
     */
    mysql: function (iteration: number, key: string | null = null): string {
        return `?`;
    },
};
export default placeholders;
