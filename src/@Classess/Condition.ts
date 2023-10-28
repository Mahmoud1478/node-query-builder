import ICondition from "../@Interfaces/ICondition";
import IQuery from "../@Interfaces/IQuery";
import { env } from "../helpers";
import { Driver, SQL } from "../@types";
import drivers from "../@Drivers";

export default class Condition implements ICondition {
    /**
     * store binding values
     *  @property values :(string | number | null)[]
     */
    protected connection: string;
    protected values: (string | number | null)[] = [];
    protected driver: Driver;
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
        this.connection = env("DB_DRIVER");
        this.driver = drivers[this.connection];
    }

    /**
     * Creates a new object of type Condition.
     *
     * @return {Condition} The newly created Condition object.
     */
    protected newObject(): ICondition {
        return new Condition(this.placeholderCounter, "");
    }

    /**
     * Sets the starting placeholder count.
     *
     * @param {number} count - The number of placeholders to start with.
     * @return {this} - The current instance of the class.
     */
    startPlaceholderFrom(count: number): this {
        this.placeholderCounter = count;
        return this;
    }

    /**
     * Adds a condition to the WHERE clause of the query.
     *
     * @param {string | CallableFunction} column - The column name or a function that defines a subquery.
     * @param {string | number | undefined} value - The value to compare the column against. Defaults to undefined.
     * @param {string} op - The comparison operator. Defaults to "=".
     * @throws {Error} Throws an error if the value of the condition is null or undefined.
     * @returns {this} Returns the QueryBuilder instance for method chaining.
     */
    where(
        column: string | CallableFunction,
        value: string | number | undefined = undefined,
        op = "="
    ): this {
        if (typeof column === "function") {
            const x = this.newObject();
            column(x);
            this.wheres.push(`(${this.mergeObject(x)})`);
        } else {
            if (value == null) {
                throw new Error(`value of the condition is null or undefined`);
            }
            this.wheres.push(
                `${column} ${op} ${this.driver.placeholder(this.placeholderCounter, column)}`
            );
            this.mergeValues(value);
        }
        return this;
    }

    /**
     * Adds a where clause to the query based on the provided column and value.
     *
     * @param {string} first - The name of the column to compare.
     * @param {string} second - The value to compare against.
     * @param {string} [op="="] - The comparison operator to use (default is "=").
     * @return {this} - The updated query builder instance.
     */
    whereColumn(first: string, second: string, op = "="): this {
        this.wheres.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * Generates a SQL WHERE NOT IN clause based on the provided column and values.
     *
     * @param {string} column - The column name to compare against.
     * @param {(string | number)[] | CallableFunction} values - The array of values or a callback function that generates the values.
     * @throws {Error} If the values array is empty.
     * @return {this} The current instance of the class.
     */
    whereIn(column: string, values: (string | number)[] | CallableFunction): this {
        if (typeof values === "function") {
            const x = this.newObject();
            values(x);
            this.wheres.push(`${column} in(${this.mergeObject(x)})`);
            return this;
        }
        if (values.length == 0) {
            throw new Error(`values of the condeition is empty`);
        }
        const placeholder: string[] = [];
        for (let i: number = this.placeholderCounter; i <= values.length; i++) {
            placeholder.push(this.driver.placeholder(i, column));
        }
        this.mergeValues(values).wheres.push(`${column} in(${placeholder.toString()})`);

        return this;
    }

    /**
     * Generates a SQL WHERE NOT IN clause based on the provided column and values.
     *
     * @param {string} column - The column name to compare against.
     * @param {(string | number)[] | CallableFunction} values - The array of values or a callback function that generates the values.
     * @throws {Error} If the values array is empty.
     * @return {this} The current instance of the class.
     */
    whereNotIn(column: string, values: (string | number)[] | CallableFunction): this {

        let q: string;
        if (typeof values === "function") {
            const x = this.newObject();
            values(x);
            q = this.mergeObject(x);
        } else {
            if (values.length == 0) {
                throw new Error(`values of the condition is empty`);
            }
            const placeholder: string[] = [];
            for (let i: number = this.placeholderCounter; i <= values.length; i++) {
                placeholder.push(this.driver.placeholder(i, column));
            }
            q = placeholder.toString();
            this.mergeValues(values);
        }

        this.wheres.push(`${column} not in(${q})`);

        return this;
    }

    /**
     * Generates a condition for the OR clause in a SQL query.
     *
     * @param {string | CallableFunction} column - The column name or a callback function that defines the condition.
     * @param {string | number | null} [value=null] - The value to compare against the column.
     * @param {string} [op="="] - The operator to use in the comparison.
     * @throws {Error} Throws an error if the value is null or undefined.
     * @returns {this} Returns the current instance of the class.
     */
    or(column: string | CallableFunction, value: string | number | null = null, op = "="): this {

        if (typeof column === "function") {
            const x = new Condition(this.placeholderCounter, "");
            column(x);
            this.ors.push(`(${this.mergeObject(x)})`);
        } else {
            if (!value) {
                throw new Error(`value of the condeition is null or undefined`);
            }
            this.ors.push(
                `${column} ${op} ${this.driver.placeholder(this.placeholderCounter, column)}`
            );
            this.mergeValues(value);
        }
        return this;
    }

    /**
     * Adds a condition to the query that checks if either the value in the specified column is equal or not equal to the specified value.
     *
     * @param {string} first - The name of the column to compare.
     * @param {string} second - The value to compare to.
     * @param {string} [op="="] - The operator to use for the comparison. Defaults to "=".
     * @return {this} - Returns the QueryBuilder instance for method chaining.
     */
    orColumn(first: string, second: string, op = "="): this {
        this.ors.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * Generate the SQL representation of the query.
     *
     * @return {[string, (string | number | null)[]]} The SQL query string and the associated values.
     */
    toSql(): SQL {
        return [
            `${this.wheres.length ? `${this.wherePrefix} ${this.wheres.join(" and ")}` : ""}${
                this.ors.length ? ` or ${this.ors.join(" or ")}` : ""
            }`.trim(),
            this.values,
        ];
    }

    /**
     * Converts the function to its raw SQL representation.
     *
     * @return {string} The raw SQL string.
     */
    toRawSql(): string {
        return this.driver.compile(this);
    }

    /**
     * Adds a condition to the query where a callback or object does not exist.
     *
     * @param {CallableFunction | IQuery} callback - A callback function or IQuery object representing the condition to check for non-existence.
     * @return {this} - Returns the current instance of the query object.
     */
    whereNotExist(callback: CallableFunction | IQuery): this {
        let x: ICondition;
        if (typeof callback === "function") {
            x = this.newObject();
            callback(x);
        } else {
            x = callback;
            x.startPlaceholderFrom(this.placeholderCounter);
        }
        this.wheres.push(`not exists(${this.mergeObject(x)})`);
        return this;
    }

    /**
     * A function that adds a "where exists" condition to the query builder.
     *
     * @param {CallableFunction | ICondition} callback - A callback function or a condition object representing the condition to check for existence
     * @return {this} - The query builder instance.
     */
    whereExists(callback: CallableFunction | ICondition): this {
        let x: ICondition;
        if (typeof callback === "function") {
            x = this.newObject();
            callback(x);
        } else {
            x = callback;
            x.startPlaceholderFrom(this.placeholderCounter);
        }
        this.wheres.push(`exists(${this.mergeObject(x)})`);
        return this;
    }

    /**
     * Merges the given `instance` object and returns a string.
     *
     * @param {ICondition} instance - The object to be merged.
     * @return {string} The merged string.
     */
    protected mergeObject(instance: ICondition): string {
        const [q, v] = instance.toSql();
        this.mergeValues(v);
        return q;
    }

    /**
     * Merges an array of values into the current values of the object.
     *
     * @param {Array<string | null | number> | string | null | number} values - The values to merge.
     * @param reverse
     * @return {this} - The updated object instance.
     */
    protected mergeValues(
        values: (string | null | number)[] | string | null | number,
        reverse = false
    ): this {
        if (!Array.isArray(values)) {
            values = [values];
        }
        this.placeholderCounter += values.length;
        if (reverse) {
            this.values = values.concat(this.values);
        } else {
            this.values = this.values.concat(values);
        }
        return this;
    }
}
