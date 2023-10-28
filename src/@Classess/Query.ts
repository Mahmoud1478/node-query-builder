import Condition from "./Condition";
import IQuery from "../@Interfaces/IQuery";
import Join from "./Join";
import Spell from "../@Spelling/PostgreSql";
import { SQL } from "../@types";

export default class Query extends Condition implements IQuery {
    /**
     * contains columns which will operate on
     * @protected
     */
    protected columns: string[] = ["*"];
    /**
     * contains tables and it's conditions which will join
     * @protected
     */
    protected joins: string[] = [];
    /**
     *
     * @protected
     */
    protected limit_: string | null = null;
    /**
     * how many record will skip
     * @protected
     */
    protected offset_: string | null = null;
    /**
     * contains columns which will return when insert or update record
     * @protected
     */
    protected return: string | null = null;
    /**
     * the statement which will perform
     * @protected
     */
    protected statement = "select";
    /**
     * contains columns which grouping by
     * @protected
     */
    protected group_by?: string | null = null;

    /**
     * contains columns with direction which ordering with
     * @protected
     */
    protected order_by: string[] = [];
    /**
     *
     * @protected
     */
    protected prams: {
        values: (string | number)[];
    } = {
        values: [],
    };

    protected union_?: string | null;

    /**
     * Constructor for the class.
     *
     * @param {string} table - the name of the table
     * @param {number} placeholder - the placeholder value (optional, default value is 1)
     * @param statement
     */
    constructor(protected table: string, statement: string, placeholder: number = 1) {
        super(placeholder, "");
        this.statement = statement;
    }

    /**
     * Sets the table name for the query.
     *
     * @param {string} table - The name of the table to query.
     * @return {this} - Returns the current instance of the class.
     */
    from(table: string): this {
        this.table = table;
        return this;
    }

    /**
     * Creates and returns a new Query object.
     *
     * @return {Query} - A new instance of the Query class.
     */
    protected newObject(statemente = ""): Query {
        return new Query(this.table, statemente, this.placeholderCounter);
    }

    /**
     * Sets the select statement of the query and the columns to be selected.
     *
     * @param {string[]} columns - The columns to be selected. Default is ["*"].
     * @returns {this} - The instance of the class.
     */
    select(columns: string[] = ["*"]): this {
        this.statement = "select";
        this.columns = columns;
        return this;
    }

    /**
     * Selects a sub-query and adds it to the columns of the query.
     *
     * @param {string | CallableFunction | IQuery} query - The sub-query to select. Can be a string, a function, or an IQuery object.
     * @param {string} [_as=""] - An optional alias for the selected sub-query.
     * @return {this} - Returns the current instance of the query builder.
     */
    selectSub(query: string | CallableFunction | IQuery, _as = ""): this {
        if (typeof query === "string") {
            this.columns.push(`(${query}) ${_as ? ` as ${_as}` : ""}`);
            return this;
        }
        let o: IQuery;
        if (typeof query === "function") {
            o = this.newObject("select");
            query(o);
        } else {
            o = query;
            o.startPlaceholderFrom(this.placeholderCounter);
        }
        this.columns.push(`(${this.mergeObject(o)})${_as ? ` as ${_as}` : ""}`);

        return this;
    }

    /**
     * Sets the update statement for the query.
     *
     * @param {Record<string, string | number>} columns - An object that represents the columns and their values.
     * @returns {this} - The instance of the class.
     */
    update(columns: Record<string, string | number>): this {
        this.columns = [];
        this.statement = "update";
        Object.keys(columns).forEach((key: string, idx): void => {
            this.columns.push(
                `${key} = ${this.driver.placeholder(this.placeholderCounter + idx, key)}`
            );
        });
        this.mergeValues(Object.values(columns), true);
        return this;
    }

    /**
     * Sets the delete statement for the query.
     *
     * @return {this} The updated object.
     */
    delete(): this {
        this.statement = "delete";
        return this;
    }

    /**
     *  Inserts a new record into the database table with the provided columns.
     *
     *  @param {Record<string, string | number | null>} columns - An object that represents the columns and their values.
     *  @returns - The instance of the current object.
     */
    insert(columns: Record<string, string | number | null>): this {
        this.statement = "insert";
        const keys: string[] = Object.keys(columns);
        this.columns = keys;
        const place: string[] = [];
        keys.forEach((key: string, idx: number) => {
            place.push(this.driver.placeholder(this.placeholderCounter + (idx + 1), key));
        });
        this.prams.values = this.prams.values.concat(`(${place.toString()})`);
        this.mergeValues(Object.values(columns));
        return this;
    }

    /**
     * Sets the limit statement for the query.
     *  @param value - The maximum number of records to return.
     *  @returns - The instance of the object that called the method.
     */
    limit(value: number): this {
        this.limit_ = this.driver.placeholder(this.placeholderCounter, "limit");
        this.mergeValues(value);
        return this;
    }

    /**
     * Sets the offset value and merges it with the existing values.
     *
     * @param {number} value - The offset value to be set.
     * @return {this} - Returns the current instance of the class.
     */
    offset(value: number): this {
        this.offset_ = this.driver.placeholder(this.placeholderCounter, "offset");
        this.mergeValues(value);
        return this;
    }

    /**
     * Groups the data by the specified columns.
     *
     * @param {string[]} columns - The columns to group the data by.
     * @return {this} - The modified instance of the class.
     */
    groupBy(columns: string[]): this {
        this.group_by = columns.toString();
        return this;
    }

    /**
     * Adds an order by clause to the query.
     *
     * @param {string} column - The column to order by.
     * @param {string} direction - The direction to order by. Default is "asc".
     * @return {this} - The current instance of the query builder.
     */
    orderBy(column: string, direction = "asc"): this {
        this.order_by.push(`${column} ${direction}`);
        return this;
    }

    /**
     * Sets the columns to be returned by the query.
     *
     * @param {string[]} columns - An array of column names to be returned. Defaults to ["*"].
     * @return {this} - The current instance of the query builder.
     */
    returning(columns: string[] = ["*"]): this {
        this.return = columns.toString();
        return this;
    }

    /**
     * Joins a table with another table using a specified condition.
     *
     * @param {string} table - The name of the table to join.
     * @param {string | CallableFunction} first - The first condition for the join.
     * @param {string | null} second - The second condition for the join. Default is null.
     * @param {string} op - The operator to use for the join condition. Default is "=".
     * @return {this} - Returns the current instance of the query builder.
     */
    join(
        table: string,
        first: string | CallableFunction,
        second: string | null = null,
        op = "="
    ): this {
        return this.baseJoin(table, "inner", first, second, op);
    }

    /**
     * Joins a table with another table using a left join.
     *
     * @param {string} table - The name of the table to join.
     * @param {string | CallableFunction} first - The first column or function to join on.
     * @param {string | null} second - The second column to join on (optional).
     * @param {string} op - The operator to use for the join operation (default is "=").
     * @return {this} The current instance of the query builder.
     */
    leftJoin(
        table: string,
        first: string | CallableFunction,
        second: string | null = null,
        op = "="
    ): this {
        return this.baseJoin(table, "left", first, second, op);
    }

    /**
     * Joins two tables using the right join operation.
     *
     * @param {string} table - The name of the table to join with.
     * @param {string | CallableFunction} first - The first column or callback function for the join condition.
     * @param {string | null} second - The second column for the join condition. Defaults to null.
     * @param {string} op - The join operator. Defaults to "=".
     * @return {this} - The current instance of the query builder.
     */
    rightJoin(
        table: string,
        first: string | CallableFunction,
        second: string | null = null,
        op = "="
    ): this {
        return this.baseJoin(table, "right", first, second, op);
    }

    /**
     * Joins a table with the current query builder.
     *
     * @param {string} table - The name of the table to join.
     * @param {string} type - The type of join (e.g., "INNER", "LEFT", "RIGHT").
     * @param {string | CallableFunction} first - The first join condition. If it's a function, it will be called with a new instance of the Join class as the argument.
     * @param {string | null} second - The second join condition. This parameter is optional and can be set to null.
     * @param {string} op - The operator to use in the join condition.
     * @return {this} - The current instance of the query builder.
     */
    private baseJoin(
        table: string,
        type: string,
        first: string | CallableFunction,
        second: string | null = null,
        op: string
    ): this {
        const jb = new Join(table, type, this.placeholderCounter);
        if (typeof first === "function") {
            first(jb);
        } else {
            jb.on(first, second as string, op);
        }
        this.joins.push(this.mergeObject(jb));
        return this;
    }

    /**
     * Joins a sub-query as a table and performs a join operation.
     *
     * @param {string | CallableFunction | IQuery} table - The sub-query table to join.
     * @param {string} as - The alias for the sub-query table.
     * @param {string | CallableFunction} first - The first column to join on.
     * @param {string | undefined} second - The second column to join on. (optional)
     * @param {string} op - The operator for the join operation. (default: "=")
     * @return {this} - The current instance of the class.
     */
    joinSub(
        table: string | CallableFunction | IQuery,
        as: string,
        first: string | CallableFunction,
        second: string | undefined,
        op = "="
    ): this {
        return this.join(`(${this.handleCallable(table)}) as ${as}`, first, second, op);
    }

    /**
     * Joins the specified sub-query or table to the current query using a left join.
     *
     * @param {string | CallableFunction | IQuery} table - The sub-query or table to join.
     * @param {string} as - The alias for the sub-query or table.
     * @param {string | CallableFunction} first - The column or callable to join on.
     * @param {string | undefined} second - The second column to join on.
     * @param {string} op - The operator to use for the join.
     * @return {this} The updated instance of the query builder.
     */
    leftJoinSub(
        table: string | CallableFunction | IQuery,
        as: string,
        first: string | CallableFunction,
        second: string | undefined,
        op = "="
    ): this {
        return this.leftJoin(`(${this.handleCallable(table)}) as ${as}`, first, second, op);
    }

    /**
     * Right join a subquery.
     *
     *  @param {string | CallableFunction | IQuery} table - The table or sub-query to join.
     *  @param {string} as - The alias for the sub-query.
     *  @param {string | CallableFunction} first - The first column or callable function for the join condition.
     *  @param {string | undefined} second - The second column for the join condition.
     *  @param {string} op - The operator for the join condition (default: "=").
     *  @returns {this} - The instance of the Query class.
     */
    rightJoinSub(
        table: string | CallableFunction | IQuery,
        as: string,
        first: string | CallableFunction,
        second: string | undefined,
        op = "="
    ): this {
        return this.rightJoin(`(${this.handleCallable(table)}) as ${as}`, first, second, op);
    }

    /**
     * Handles the given callable query and returns a string representation.
     *
     * @param {CallableFunction | string | IQuery} query - The callable query to be handled.
     * @return {string} - The string representation of the callable query.
     */
    private handleCallable(query: CallableFunction | string | IQuery): string {
        if (typeof query === "string") {
            return query;
        }
        let q: IQuery;
        if (typeof query === "function") {
            q = this.newObject("select");
            query(q);
        } else {
            q = query;
            q.startPlaceholderFrom(this.placeholderCounter);
        }
        return this.mergeObject(q);
    }

    /**
     * Generates the SQL representation of the current query.
     *
     * @return {[string, (string | number | null)[]]} The SQL query string and the corresponding parameter values.
     */
    toSql(): SQL {
        if (!this.statement) {
            return super.toSql();
        }
        return [
            `${
                this.statement
                    ? Spell[this.statement](this.table, this.columns.toString(), this.prams)
                    : ""
            }${this.joins.length ? ` ${this.joins.join(" ")}` : ""}${
                this.wheres.length ? ` where ${this.wheres.join(" and ")}` : ""
            }${this.ors.length ? ` or ${this.ors.join(" or ")}` : ""}${
                this.group_by ? ` group by ${this.group_by}` : ""
            } ${this.order_by.length ? ` order by ${this.order_by.join(" ")}` : ""}${
                this.limit_ ? ` limit ${this.limit_}` : ""
            } ${this.offset_ ? ` offset ${this.offset_}` : ""}${
                this.return ? ` returning ${this.return}` : ""
            }${this.union_ ? `union ${this.union_}` : ""}`.trimEnd(),
            this.values,
        ];
    }

    /**
     * A description of the entire function.
     *
     * @param {string | CallableFunction | IQuery} query - description of the query parameter
     * @return {this} description of the return value
     */
    union(query: string | CallableFunction | IQuery): this {
        this.union_ = this.handleCallable(query);
        return this;
    }
}
