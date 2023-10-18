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
export interface ICondeition {
    where: (column: string | CallableFunction, value?: string | number, op?: string) => this;
    whereIn: (column: string, values: (string | number)[] | CallableFunction) => this;
    whereColumn: (first: string, second: string, op?: string) => this;
    orColumn: (first: string, second: string, op?: string) => this;
    or: (column: string | CallableFunction, value?: string | number, op?: string) => this;
}

export interface IQuery extends ICondeition {
    from: (table: string) => this;
    select: (columns: string[]) => this;
    selectSub: (query: string | CallableFunction, _as?: string) => this;
    upddte: (columns: Record<string, string | number>) => this;
    delete: () => this;
    insert: (columns: string[]) => this;
    limit: (value: number) => this;
    offset: (value: number) => this;
    returning: (colmuns: string[]) => this;
    join: (table: string, first: string | CallableFunction, second?: string, op?: string) => this;
    leftJoin: (
        table: string,
        first: string | CallableFunction,
        second?: string,
        op?: string
    ) => this;
    rightJoin: (
        table: string,
        first: string | CallableFunction,
        second?: string,
        op?: string
    ) => this;
    toSql: () => [string, (string | number)[]];
}

class Condeition implements ICondeition {
    protected values: (string | number)[] = [];
    protected wheres: string[] = [];
    protected ors: string[] = [];
    protected placeholderCounter: number;
    constructor(placeholderCounter: number, protected wherePrefix = "where") {
        this.placeholderCounter = placeholderCounter;
    }
    /**
     * get new object
     * @returns new self
     */
    protected newObject(): Condeition {
        return new Condeition(this.placeholderCounter, "");
    }
    /**
     * add where statement to filter records
     * @param column string|callback
     * @param value string|number -> required if column isn't callback
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns this
     */
    where(
        column: string | CallableFunction,
        value: string | number | undefined = undefined,
        op = "="
    ) {
        if (typeof column === "function") {
            const x = new Condeition(this.placeholderCounter, "");
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
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns this
     */
    whereColumn(first: string, second: string, op = "=") {
        this.wheres.push(`${first} ${op} ${second}`);
        return this;
    }
    /**
     * add where in statement to filter records
     * @param column string|callback
     * @param value string|number -> required if column isn't callback
     * @param op? string -> (=,>,<,<=,>=,like)
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
     * @param value string|number -> required if column isn't callback
     * @param op? string -> (=,>,<,<=,>=,like)
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
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns this
     */
    or(column: string | CallableFunction, value: string | number | null = null, op = "=") {
        if (typeof column === "function") {
            const x = new Condeition(this.placeholderCounter, "");
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
     * @param first colmun :string
     * @param second column :string
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns this
     */
    orColumn(first: string, second: string, op = "=") {
        this.ors.push(`${first} ${op} ${second}`);
        return this;
    }
    /**
     * compile opject to get query and values
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
class Join extends Condeition {
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
     * add and condition to statment to join query
     * @param first column string
     * @param second column string
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns object instatce
     */
    on(first: string, second: string, op = "=") {
        this.wheres.push(`${first} ${op} ${second}`);
        return this;
    }
    /**
     * add or condition to statment to join query
     * @param first column string
     * @param second column string
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns object instatce
     */
    orOn(first: string, second: string, op = "=") {
        this.ors.push(`${first} ${op} ${second}`);
        return this;
    }
    /**
     * compile opject to get query and values
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

class Query extends Condeition implements IQuery {
    protected columns: string[] = ["*"];
    protected joins: string[] = [];
    protected limit_: string | null = null;
    protected offset_: string | null = null;
    protected return: string | null = null;
    protected statement = "select";
    protected prams = {};
    constructor(protected table: string, placeholder = 1) {
        super(placeholder);
    }
    /**
     * set table
     * @param table string
     * @returns instance object
     */
    from(table: string) {
        this.table = table;
        return this;
    }
    protected newObject(): Condeition {
        return new Query(this.table, this.placeholderCounter);
    }
    /**
     * add select statment to query with provided columns
     * @param columns string[] -> defualt = ["*"]
     * @returns instance object
     */
    select(columns: string[] = ["*"]) {
        this.statement = "select";
        this.columns = columns;
        return this;
    }
    /**
     * add sub query to colums
     * @param query string | callback
     * @param _as? string
     * @returns instance object
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
     * add update statment to query with provided columns
     * @param columns
     * @returns instance object
     */
    upddte(columns: Record<string, string | number>) {
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
     * add delete statmennt to query
     * @returns instance object
     */
    delete() {
        this.statement = "delete";
        return this;
    }
    /**
     * add insert statement to query with provided columns
     * @param columns string[]
     * @returns instance object
     */
    insert(columns: string[]) {
        this.statement = "insert";
        return this;
    }
    /**
     * add limit statment
     * @param value nubber
     * @returns instance object
     */
    limit(value: number) {
        this.limit_ = `$${this.placeholderCounter}`;
        this.placeholderCounter++;
        this.values.push(value);
        return this;
    }
    /**
     * add offset statment
     * @param value nubber
     * @returns instance object
     */
    offset(value: number) {
        this.offset_ = `$${this.placeholderCounter}`;
        this.placeholderCounter++;
        this.values.push(value);
        return this;
    }
    /**
     * add RETURNING colums
     * @param columns string[]
     * @returns instance object
     */
    returning(columns: string[] = ["*"]) {
        this.return = columns.toString();
        return this;
    }
    /**
     * add inner join statment to query
     * @param table string
     * @param first string|callback
     * @param second string|null -> requird if first columns isn't callback
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns instance object
     */
    join(table: string, first: string | CallableFunction, second: string | null = null, op = "=") {
        const jb = new Join(table, "inner", this.placeholderCounter);
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
     * add left join statment to query
     * @param table string
     * @param first string|callback
     * @param second string|null -> requird if first columns isn't callback
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns instance object
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
     * add left join statment to query
     * @param table string
     * @param first string|callback
     * @param second string|null -> requird if first columns isn't callback
     * @param op? string -> (=,>,<,<=,>=,like)
     * @returns instance object
     */
    rightJoin(
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
    static table(table: string): Query {
        return new Query(table);
    }
}
export default DB;
