import ICondition from "./ICondition";

export default interface IQuery extends ICondition {
    /**
     * set the table which we're dealing with
     * @param table
     * @return this
     */
    from: (table: string) => this;
    /**
     * set select statement
     * @param columns
     * @return this
     */
    select: (columns: string[]) => this;
    /**
     * add sub select column to columns which will returning
     * @param query
     * @param _as
     * @return this
     */
    selectSub: (query: string | CallableFunction | IQuery, _as?: string) => this;
    /**
     * set update statement
     * @param columns
     * @return this
     */
    update: (columns: Record<string, string | number>) => this;
    /**
     * @return this
     */
    delete: () => this;
    /**
     * set inset statement
     * @param columns
     * @return this
     */
    insert: (columns: Record<string, number | null | string>) => this;
    /**
     * add limit to the query
     * @param value
     * @return this
     */
    limit: (value: number) => this;
    /**
     * add offset to the query
     * @param value
     * @return this
     */
    offset: (value: number) => this;
    /**
     * add returning to end of the query
     * @param colmuns
     * @return this
     */
    returning: (columns: string[]) => this;
    /**
     * add inner join to the query
     * @param table
     * @param first
     * @param second
     * @param op
     * @return this
     */
    join: (table: string, first: string | CallableFunction, second?: string, op?: string) => this;
    /**
     * add left join to the query
     * @param table
     * @param first
     * @param second
     * @param op
     * @return this
     */
    leftJoin: (
        table: string,
        first: string | CallableFunction,
        second?: string,
        op?: string
    ) => this;
    /**
     * add right join to the query
     * @param table
     * @param first
     * @param second
     * @param op
     * @return this
     */
    rightJoin: (
        table: string,
        first: string | CallableFunction,
        second?: string,
        op?: string
    ) => this;

    /**
     * inner join sub select query
     * @param table : string | CallableFunction
     * @param as : string
     * @param first : string | CallableFunction
     * @param second : string
     * @return this
     */
    joinSub: (
        table: string | CallableFunction | IQuery,
        as: string,
        first: string | CallableFunction,
        second?: string,
        op?: string
    ) => this;
    /**
     * left join sub select query
     * @param table : string | CallableFunction
     * @param as : string
     * @param first : string | CallableFunction
     * @param second : string
     * @return this
     */
    leftJoinSub: (
        table: string | CallableFunction | IQuery,
        as: string,
        first: string | CallableFunction,
        second?: string,
        op?: string
    ) => this;
    /**
     * right join sub select query
     * @param table : string | CallableFunction
     * @param as : string
     * @param first : string | CallableFunction
     * @param second : string
     * @return this
     */
    rightJoinSub: (
        table: string | CallableFunction | IQuery,
        as: string,
        first: string | CallableFunction,
        second?: string,
        op?: string
    ) => this;
    /**
     * add group by to the query
     * @param columns
     * @return this
     */
    groupBy: (columns: string[]) => this;
    /**
     * add order by to the query
     * @param column
     * @param direction
     */
    orderBy: (column: string, direction?: string) => this;
    /**
     * add union to the query
     * @param query :string | Function
     */
    union: (query: string | CallableFunction | IQuery) => this;
}
