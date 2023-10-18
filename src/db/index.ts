const sqlStatements = {
    select: (table: string, columns: string, prams: Record<string, any>) =>
        `select ${columns} from ${table}`,
    update: (table: string, columns: string, prams: Record<string, any>) =>
        `update ${table} set ${columns}`,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete: (table: string, _column: string, _prams: Record<string, any>) => `delete from ${table}`,
    insert: (table: string, columns: string, prams: Record<string, any>) =>
        `insert into ${table} (${columns}) values ${prams.values}`,
};

export interface IJoin extends ICondition {
    /**
     * add and condition to statement to join query
     * @param first column string
     * @param second column string
     * @param op
     * @returns this
     */
    on: (first: string, second: string, op: string) => this;

    /**
     * add or condition to statement to join query
     * @param first column string
     * @param second column string
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns this
     */
    orOn: (first: string, second: string, op: string) => this;
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
}

export interface IQuery extends ICondition {
    /**
     *
     * @param table
     * @return this
     */
    from: (table: string) => this;
    /**
     *
     * @param columns
     * @return this
     */
    select: (columns: string[]) => this;
    /**
     *
     * @param query
     * @param _as
     * @return this
     */
    selectSub: (query: string | CallableFunction, _as?: string) => this;
    /**
     *
     * @param columns
     * @return this
     */
    update: (columns: Record<string, string | number>) => this;
    /**
     * @return this
     */
    delete: () => this;
    /**
     *
     * @param columns
     * @return this
     */
    insert: (columns: string[]) => this;
    /**
     *
     * @param value
     * @return this
     */
    limit: (value: number) => this;
    /**
     *
     * @param value
     * @return this
     */
    offset: (value: number) => this;
    /**
     *
     * @param colmuns
     * @return this
     */
    returning: (columns: string[]) => this;
    /**
     *
     * @param table
     * @param first
     * @param second
     * @param op
     * @return this
     */
    join: (table: string, first: string | CallableFunction, second?: string, op?: string) => this;
    /**
     *
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
     *
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
     *@return [string , (string|number)[]
     */
    toSql: () => [string, (string | number)[]];
}

class Condition implements ICondition {
    /**
     *
     *  @property values :(string | number)[]
     */
    protected values: (string | number)[] = [];
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
     * @param column string|callback
     * @param value string|number -> required if column isn't callback
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
            const [q, v] = x.toSql();
            this.wheres.push(`(${q})`);
            this.placeholderCounter += v.length;
            this.values = this.values.concat(v);
        } else {
            if (!value) {
                throw new Error(`value of the condeition is null or undefined`);
            }
            this.wheres.push(`${column} ${op} $${this.placeholderCounter}`);
            this.placeholderCounter++;
            this.values.push(value);
        }
        return this;
    }

    /**
     * add where statement to filter records
     * @param first colmun :string
     * @param second column :string
     * @param op
     * @returns this
     */
    whereColumn(first: string, second: string, op = "=") {
        this.wheres.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * add where in statement to filter records
     * @param column string|callback
     * @param values
     * @returns this
     */
    whereIn(column: string, values: (string | number)[] | CallableFunction) {
        if (typeof values === "function") {
            const x = this.newObject();
            values(x);
            const [q, v] = x.toSql();
            this.wheres.push(`${column} in (${q})`);
            this.placeholderCounter += v.length;
            this.values = this.values.concat(v);
        } else {
            if (values.length == 0) {
                throw new Error(`values of the condeition is empty`);
            }
            const placeholder: string[] = [];
            for (let i = 0; i < values.length; i++) {
                placeholder.push(`$${this.placeholderCounter}`);
                this.placeholderCounter++;
            }
            this.wheres.push(`${column} in (${placeholder.toString()})`);
            this.placeholderCounter++;
            this.values = this.values.concat(values);
        }
        return this;
    }

    /**
     * add where in statement to filter records
     * @param column string|callback
     * @param values
     * @returns this
     */
    whereNotIn(column: string, values: (string | number)[] | CallableFunction) {
        if (typeof values === "function") {
            const x = this.newObject();
            values(x);
            const [q, v] = x.toSql();
            this.wheres.push(`${column} not in (${q})`);
            this.placeholderCounter += v.length;
            this.values = this.values.concat(v);
        } else {
            if (values.length == 0) {
                throw new Error(`values of the condeition is empty`);
            }
            const placeholder: string[] = [];
            for (let i = 0; i < values.length; i++) {
                placeholder.push(`$${this.placeholderCounter}`);
                this.placeholderCounter++;
            }
            this.wheres.push(`${column} not in (${placeholder.toString()})`);
            this.placeholderCounter++;
            this.values = this.values.concat(values);
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
            const [q, v] = x.toSql();
            this.ors.push(`(${q})`);
            this.placeholderCounter += v.length;
            this.values = this.values.concat(v);
        } else {
            if (!value) {
                throw new Error(`value of the condeition is null or undefined`);
            }
            this.ors.push(`${column} ${op} $${this.placeholderCounter}`);
            this.placeholderCounter++;
            this.values.push(value);
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
    toSql(): [string, (string | number)[]] {
        return [
            `${this.wheres.length ? `${this.wherePrefix} ${this.wheres.join(" and ")}` : ""}${
                this.ors.length ? ` or ${this.ors.join(" or ")}` : ""
            }`.trim(),
            this.values,
        ];
    }
}

class Join extends Condition {
    protected options = {
        type: "",
        table: "",
    };

    /**
     * join query builder
     * @param table string
     * @param type string
     * @param counter number
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
     * @param first column string
     * @param second column string
     * @param op
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
    toSql(): [string, (string | number)[]] {
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
     *
     * @protected
     */
    protected columns: string[] = ["*"];
    /**
     *
     * @protected
     */
    protected joins: string[] = [];
    /**
     *
     * @protected
     */
    protected limit_: string | null = null;
    /**
     *
     * @protected
     */
    protected offset_: string | null = null;
    /**
     *
     * @protected
     */
    protected return: string | null = null;
    /**
     *
     * @protected
     */
    protected statement = "select";
    /**
     *
     * @protected
     */
    protected prams = {};

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
            const [q, v] = o.toSql();
            this.placeholderCounter += v.length;
            this.values = this.values.concat(v);
            this.columns.push(`(${q})${_as ? ` as ${_as}` : ""}`);
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
            this.placeholderCounter++;
        });
        this.values = this.values.concat(Object.values(columns));
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
     * @param columns string[]
     * @returns this
     */
    insert(columns: string[]) {
        this.statement = "insert";
        return this;
    }

    /**
     * add limit statement
     * @param value nubber
     * @returns this
     */
    limit(value: number) {
        this.limit_ = `$${this.placeholderCounter}`;
        this.placeholderCounter++;
        this.values.push(value);
        return this;
    }

    /**
     * add offset statement
     * @param value number
     * @returns this
     */
    offset(value: number) {
        this.offset_ = `$${this.placeholderCounter}`;
        this.placeholderCounter++;
        this.values.push(value);
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
        const jb: Join = new Join(table, "inner", this.placeholderCounter);
        if (typeof first == "function") {
            first(jb);
        } else {
            jb.on(first, second as string, op);
        }
        const [q, v] = jb.toSql();
        this.placeholderCounter += v.length;
        this.joins.push(q);
        this.values = this.values.concat(v);
        return this;
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
        const jb = new Join(table, "left", this.placeholderCounter);
        if (typeof first == "function") {
            first(jb);
        } else {
            jb.on(first, second as string, op);
        }
        const [q, v] = jb.toSql();
        this.placeholderCounter += v.length;
        this.joins.push(q);
        this.values = this.values.concat(v);
        return this;
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
        const jb = new Join(table, "right", this.placeholderCounter);
        if (typeof first == "function") {
            first(jb);
        } else {
            jb.on(first, second as string, op);
        }
        const [q, v] = jb.toSql();
        this.placeholderCounter += v.length;
        this.joins.push(q);
        this.values = this.values.concat(v);
        return this;
    }

    /**
     * @return [string, (string | number)[]]
     */
    toSql(): [string, (string | number)[]] {
        return [
            `${sqlStatements[this.statement](this.table, this.columns.toString(), this.prams)}${
                this.joins.length ? ` ${this.joins.join(" ")}` : ""
            }${this.wheres.length ? ` where ${this.wheres.join(" and ")}` : ""}${
                this.ors.length ? ` or ${this.ors.join(" or ")}` : ""
            }${this.limit_ ? ` limit ${this.limit_}` : ""} ${
                this.offset_ ? ` offset ${this.offset_}` : ""
            }${this.return ? ` returning ${this.return}` : ""}`.trimEnd(),
            this.values,
        ];
    }
}

class DB {
    /**
     *
     * @param table
     * @return Query
     */
    static table(table: string): Query {
        return new Query(table);
    }
}

export default DB;
