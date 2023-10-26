const placeholders: Record<string, (iteration: number, key?: string) => string> = {
    /**
     * Returns a string representation of the iterator.
     *
     * @param {number} iteration - The iterator to convert to a string.
     * @param {string | null} key - An optional key to include in the string representation.
     * @returns {string} - The string representation of the iterator.
     */
    pg: function (iteration: number, key: string | null = null): string {
        return `$${iteration}`;
    },
};
export default placeholders;

