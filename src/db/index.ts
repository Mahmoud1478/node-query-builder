const sqlStatements = {
    select: (table: string, columns: string, prams: Record<string, any>) =>
        `select ${columns} from ${table}`,
    update: (table: string, columns: string, prams: Record<string, any>) =>
        `update ${table} set ${columns}`,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete: (table: string, _column: string, _prams: Record<string, any>) => `delete from ${table}`,
    insert: (table: string, columns: string, prams: Record<string, any>) =>
        `insert into ${table} (${columns}) values ${prams.values.join(" ")}`,
};

export interface IJoin extends ICondition {
    /**
     * add and condition to statement to join query
     * @param first column string
     * @param second column string
     * @param op
     * @returns this
     */
    on: (first: string, second: string, op?: string) => this;

    /**
     * add or condition to statement to join query
     * @param first column string
     * @param second column string
     * @param op
     * @returns this
     */
    orOn: (first: string, second: string, op?: string) => this;
}

export interface ICondition {
    /**
     *
     * @param column
     * @param value
     * @param op
     * @return this
     */
    where: (column: string | CallableFunction, value?: string | number, op?: string) => this;
    /**
     *
     * @param column
     * @param values
     * @return this
     */
    whereIn: (column: string, values: (string | number)[] | CallableFunction) => this;
    /**
     * @param first
     * @param second
     * @param op
     * @return this
     */
    whereColumn: (first: string, second: string, op?: string) => this;
    /**
     *
     * @param first
     * @param second
     * @param op
     * @return this
     */
    orColumn: (first: string, second: string, op?: string) => this;
    /**
     *
     * @param column
     * @param value
     * @param op
     * @return this
     */
    or: (column: string | CallableFunction, value?: string | number, op?: string) => this;
    /**
     *
     * @param callback
     */
    whereExists: (callback: CallableFunction) => this;
    /**
     *
     * @param callback
     */
    whereNotExist: (callback: CallableFunction) => this;
    /**
     * get sql statement with binding values
     *@return [string , (string|number)[]
     */
    toSql: () => [string, (string | number | null)[]];
    /**
     *  get raw sql combine with binding values
     * @return string
     */
    toRawSql: () => string;
}

export interface IQuery extends ICondition {
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
    selectSub: (query: string | CallableFunction, _as?: string) => this;
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
        table: string | CallableFunction,
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
        table: string | CallableFunction,
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
        table: string | CallableFunction,
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
    union: (query: string | CallableFunction) => this;
}

class Condition implements ICondition {
    /**
     * store binding values
     *  @property values :(string | number | null)[]
     */
    protected values: (string | number | null)[] = [];
    /**
     *
     * @protected
     */
    protected wheres: string[] = [];
    /**
     *
     * @protected
     */
    protected ors: string[] = [];
    /**
     *
     * @protected
     */
    protected placeholderCounter: number;

    /**
     *
     * @param placeholderCounter
     * @param wherePrefix
     */
    constructor(placeholderCounter: number, protected wherePrefix = "where") {
        this.placeholderCounter = placeholderCounter;
    }

    /**
     * get new object
     * @returns new self
     */
    protected newObject(): Condition {
        return new Condition(this.placeholderCounter, "");
    }

    /**
     * add where statement to filter records
     * @param column :(string|callback)
     * @param value :(string|number) -> required if column isn't callback
     * @param op
     * @returns this
     */
    where(
        column: string | CallableFunction,
        value: string | number | undefined = undefined,
        op = "="
    ) {
        if (typeof column === "function") {
            const x = new Condition(this.placeholderCounter, "");
            column(x);
            this.wheres.push(`(${this.mergeObject(x)})`);
        } else {
            if (value == null) {
                throw new Error(`value of the condition is null or undefined`);
            }
            this.wheres.push(`${column} ${op} $${this.placeholderCounter}`);
            this.mergeValues(value);
        }
        return this;
    }

    /**
     * add where statement to filter records
     * @param first
     * @param second
     * @param op
     * @returns this
     */
    whereColumn(first: string, second: string, op = "=") {
        this.wheres.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * add where in statement to filter records
     * @param column :(string|callback)
     * @param values
     * @returns this
     */
    whereIn(column: string, values: (string | number)[] | CallableFunction) {
        if (typeof values === "function") {
            const x = this.newObject();
            values(x);
            this.wheres.push(`${column} in(${this.mergeObject(x)})`);
        } else {
            if (values.length == 0) {
                throw new Error(`values of the condeition is empty`);
            }
            const placeholder: string[] = [];
            for (let i = this.placeholderCounter; i <= values.length; i++) {
                placeholder.push(`$${i}`);
            }
            this.mergeValues(values).wheres.push(`${column} in(${placeholder.toString()})`);
        }
        return this;
    }

    /**
     * add where in statement to filter records
     * @param column :(string|callback)
     * @param values :(string | number)[]
     * @returns this
     */
    whereNotIn(column: string, values: (string | number)[] | CallableFunction) {
        if (typeof values === "function") {
            const x = this.newObject();
            values(x);
            this.wheres.push(`${column} not in(${this.mergeObject(x)})`);
        } else {
            if (values.length == 0) {
                throw new Error(`values of the condition is empty`);
            }
            const placeholder: string[] = [];
            for (let i = this.placeholderCounter; i <= values.length; i++) {
                placeholder.push(`$${i}`);
            }
            this.mergeValues(values).wheres.push(`${column} not in(${placeholder.toString()})`);
        }
        return this;
    }

    /**
     * add or statement to filter records
     * @param column string|callback
     * @param value string|number -> required if column isn't callback
     * @param op
     * @returns this
     */
    or(column: string | CallableFunction, value: string | number | null = null, op = "=") {
        if (typeof column === "function") {
            const x = new Condition(this.placeholderCounter, "");
            column(x);
            this.ors.push(`(${this.mergeObject(x)})`);
        } else {
            if (!value) {
                throw new Error(`value of the condeition is null or undefined`);
            }
            this.ors.push(`${column} ${op} $${this.placeholderCounter}`);
            this.mergeValues(value);
        }
        return this;
    }

    /**
     * add or statement to filter records
     * @param first column :string
     * @param second column :string
     * @param op
     * @returns this
     */
    orColumn(first: string, second: string, op = "=") {
        this.ors.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * compile object to get query and values
     * @returns [query:string,values:(string|number)[]
     */
    toSql(): [string, (string | number | null)[]] {
        return [
            `${this.wheres.length ? `${this.wherePrefix} ${this.wheres.join(" and ")}` : ""}${
                this.ors.length ? ` or ${this.ors.join(" or ")}` : ""
            }`.trim(),
            this.values,
        ];
    }

    toRawSql(): string {
        const [q, v] = this.toSql();
        let y: string = q;
        v.forEach((item, idx) => {
            y = y.replace(`$${idx + 1}`, item as string);
        });
        return y;
    }

    whereNotExist(callback: CallableFunction): this {
        const x = this.newObject();
        callback(x);
        this.wheres.push(`not exists(${this.mergeObject(x)})`);
        return this;
    }

    /**
     * add sub exist query to wheres
     * @param callback
     */
    whereExists(callback: CallableFunction): this {
        const x = this.newObject();
        callback(x);
        this.wheres.push(`exists(${this.mergeObject(x)})`);
        return this;
    }

    protected mergeObject(instance: ICondition): string {
        const [q, v] = instance.toSql();
        this.mergeValues(v);
        return q;
    }

    protected mergeValues(values: (string | null | number)[] | string | null | number): this {
        if (!Array.isArray(values)) {
            values = [values];
        }
        this.placeholderCounter += values.length;
        this.values = this.values.concat(values);
        return this;
    }
}

class Join extends Condition implements IJoin {
    protected options = {
        type: "",
        table: "",
    };

    /**
     * join query builder
     * @param table :string
     * @param type :string
     * @param counter :number
     */
    constructor(table: string, type: string, counter: number) {
        super(counter, "");
        this.options = {
            table,
            type,
        };
    }

    /**
     * add and condition to statement to join query
     * @param first :string
     * @param second :string
     * @param op :string
     * @returns this
     */
    on(first: string, second: string, op = "=") {
        this.wheres.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * add or condition to statement to join query
     * @param first column string
     * @param second column string
     * @param op
     * @returns this
     */
    orOn(first: string, second: string, op = "=") {
        this.ors.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * compile object to get query and values
     * @returns [query:string,values:(string|number)[]
     */
    toSql(): [string, (string | number | null)[]] {
        return [
            `${this.options.type} join ${this.options.table} ${
                this.wheres.length ? `on ${this.wheres.join(" and ")}` : ""
            }${this.ors.length ? ` or ${this.ors.join(" or ")}` : ""}`.trimEnd(),
            this.values,
        ];
    }
}

class Query extends Condition implements IQuery {
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
     *
     * @param table
     * @param placeholder
     */
    constructor(protected table: string, placeholder = 1) {
        super(placeholder);
    }

    /**
     * set table
     * @param table string
     * @returns this
     */

    from(table: string) {
        this.table = table;
        return this;
    }

    /**
     *
     * @protected
     */
    protected newObject(): Condition {
        return new Query(this.table, this.placeholderCounter);
    }

    /**
     * add select statement to query with provided columns
     * @param columns string[] -> default = ["*"]
     * @returns this
     */
    select(columns: string[] = ["*"]) {
        this.statement = "select";
        this.columns = columns;
        return this;
    }

    /**
     * add sub query to columns
     * @param query string | callback
     * @param _as
     * @returns this
     */
    selectSub(query: string | CallableFunction, _as = "") {
        if (typeof query === "function") {
            const o = this.newObject();
            query(o);
            this.columns.push(`(${this.mergeObject(o)})${_as ? ` as ${_as}` : ""}`);
        } else {
            this.columns.push(`(${query}) ${_as ? ` as ${_as}` : ""}`);
        }
        return this;
    }

    /**
     * add update statement to query with provided columns
     * @param columns
     * @returns this
     */
    update(columns: Record<string, string | number>) {
        this.columns = [];
        this.statement = "update";
        Object.keys(columns).forEach((key) => {
            this.columns.push(`${key} = $${this.placeholderCounter}`);
        });
        this.mergeValues(Object.values(columns));
        return this;
    }

    /**
     * add delete statement to query
     * @returns this
     */
    delete() {
        this.statement = "delete";
        return this;
    }

    /**
     * add insert statement to query with provided columns
     * @param columns Record<string | number>
     * @returns this
     */
    insert(columns: Record<string, string | number | null>): this {
        this.statement = "insert";
        const keys: string[] = Object.keys(columns);
        this.columns = keys;
        const place: string[] = [];
        for (
            let i: number = this.placeholderCounter;
            i < this.placeholderCounter + keys.length;
            i++
        ) {
            place.push(`$${i}`);
        }
        this.prams.values = this.prams.values.concat(`(${place.toString()})`);
        this.mergeValues(Object.values(columns));
        return this;
    }

    /**
     * add limit statement
     * @param value number
     * @returns this
     */
    limit(value: number) {
        this.limit_ = `$${this.placeholderCounter}`;
        this.mergeValues(value);
        return this;
    }

    /**
     * add offset statement
     * @param value number
     * @returns this
     */
    offset(value: number) {
        this.offset_ = `$${this.placeholderCounter}`;
        this.mergeValues(value);
        return this;
    }

    /**
     * add group by to query
     * @param columns :string[]
     * @return this
     */
    groupBy(columns: string[]): this {
        this.group_by = columns.toString();
        return this;
    }

    /**
     * add order by to query
     * @param column :string
     * @param direction :string
     */
    orderBy(column: string, direction = "asc"): this {
        this.order_by.push(`${column} ${direction}`);
        return this;
    }

    /**
     * add RETURNING columns
     * @param columns string[]
     * @returns this
     */
    returning(columns: string[] = ["*"]) {
        this.return = columns.toString();
        return this;
    }

    /**
     * add inner join statement to query
     * @param table string
     * @param first string|callback
     * @param second string|null -> required if first columns isn't callback
     * @param op
     * @returns this
     */
    join(table: string, first: string | CallableFunction, second: string | null = null, op = "=") {
        return this.baseJoin(table, "inner", first, second, op);
    }

    /**
     * add left join statement to query
     * @param table string
     * @param first string|callback
     * @param second string|null -> required if first columns isn't callback
     * @param op
     * @returns this
     */
    leftJoin(
        table: string,
        first: string | CallableFunction,
        second: string | null = null,
        op = "="
    ) {
        return this.baseJoin(table, "left", first, second, op);
    }

    /**
     * add left join statement to query
     * @param table string
     * @param first string|callback
     * @param second string|null -> required if first columns isn't callback
     * @param op
     * @returns this
     */
    rightJoin(
        table: string,
        first: string | CallableFunction,
        second: string | null = null,
        op = "="
    ) {
        return this.baseJoin(table, "right", first, second, op);
    }

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
     * inner join sub select query
     * @param table : string | CallableFunction
     * @param as
     * @param first : string | CallableFunction
     * @param second : string
     * @param op
     * @return this
     */
    joinSub(
        table: string | CallableFunction,
        as: string,
        first: string | CallableFunction,
        second: string | undefined,
        op = "="
    ): this {
        return this.join(`(${this.handleCallable(table)}) as ${as}`, first, second, op);
    }

    /**
     * left join sub select query
     * @param table : string | CallableFunction
     * @param as
     * @param first : string | CallableFunction
     * @param second : string
     * @param op
     * @return this
     */
    leftJoinSub(
        table: string | CallableFunction,
        as: string,
        first: string | CallableFunction,
        second: string | undefined,
        op = "="
    ): this {
        return this.leftJoin(`(${this.handleCallable(table)}) as ${as}`, first, second, op);
    }

    /**
     * right join sub select query
     * @param table : string | CallableFunction
     * @param as
     * @param first : string | CallableFunction
     * @param second : string
     * @param op
     * @return this
     */
    rightJoinSub(
        table: string | CallableFunction,
        as: string,
        first: string | CallableFunction,
        second: string | undefined,
        op = "="
    ): this {
        return this.rightJoin(`(${this.handleCallable(table)}) as ${as}`, first, second, op);
    }

    /**
     * get the sting of table to join
     * @private
     * @return string
     * @param query
     */
    private handleCallable(query: CallableFunction | string): string {
        if (typeof query === "string") {
            return query;
        }
        const q = this.newObject();
        query(q);
        return this.mergeObject(q);
    }

    /**
     * @return [string, (string | number|null)[]]
     */
    toSql(): [string, (string | number | null)[]] {
        return [
            `${sqlStatements[this.statement](this.table, this.columns.toString(), this.prams)}${
                this.joins.length ? ` ${this.joins.join(" ")}` : ""
            }${this.wheres.length ? ` where ${this.wheres.join(" and ")}` : ""}${
                this.ors.length ? ` or ${this.ors.join(" or ")}` : ""
            }${this.group_by ? ` group by ${this.group_by}` : ""} ${
                this.order_by.length ? ` order by ${this.order_by.join(" ")}` : ""
            }${this.limit_ ? ` limit ${this.limit_}` : ""} ${
                this.offset_ ? ` offset ${this.offset_}` : ""
            }${this.return ? ` returning ${this.return}` : ""}${
                this.union_ ? `union ${this.union_}` : ""
            }`.trimEnd(),
            this.values,
        ];
    }

    union(query: string | CallableFunction): this {
        this.union_ = this.handleCallable(query);
        return this;
    }
}

class DB {
    /**
     * get a new query object
     * @param table
     * @return Query
     */
    static table(table: string): Query {
        return new Query(table);
    }
}

export default DB;
