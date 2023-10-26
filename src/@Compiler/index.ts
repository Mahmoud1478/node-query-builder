import placeholders from "../@Placeholder";
import ICondition from "../@Interfaces/ICondition";

const compilers: Record<string, (query: ICondition) => string> = {
    /**
     * Returns Raw SQL Using PostgresSQL config.
     *
     * @returns {string} - The string representation of the iterator.
     * @param query
     */
    pg: function (query: ICondition): string {
        const [q, v] = query.toSql();
        let y: string = q;
        v.forEach((item, idx) => {
            y = y.replace(placeholders["pg"](idx + 1), item as string);
        });
        return y;
    },
    /**
     * rReturns Raw SQL Using MySQL config.
     *
     * @return {string} - the result of the query
     * @param query
     */
    mysql: function (query: ICondition): string {
        const [q, v] = query.toSql();
        let y: string = q;
        v.forEach((item, idx) => {
            y = y.replace(placeholders["mysql"](idx + 1), item as string);
        });
        return y;
    },
};

export default compilers;
