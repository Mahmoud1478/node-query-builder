import Query from "./@Classess/Query";

class DB {
    /**
     * Create a new Query object for the given table.
     *
     * @param table - The name of the table to query.
     * @returns {Query} - The new Query object.
     */
    static table(table: string): Query {
        return new Query(table, "select");
    }
}

export default DB;
