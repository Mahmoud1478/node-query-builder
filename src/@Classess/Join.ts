import Condition from "./Condition";
import IJoin from "../@Interfaces/IJoin";

export default class Join extends Condition implements IJoin {
    protected options = {
        type: "",
        table: "",
    };

    /**
     * Constructor for the class.
     *
     * @param {string} table - The table parameter.
     * @param {string} type - The type parameter.
     * @param {number} counter - The counter parameter.
     */
    constructor(table: string, type: string, counter: number) {
        super(counter, "");
        this.options = {
            table,
            type,
        };
    }

    /**
     * Adds a condition to the query.
     *
     * @param {string} first - The first value to compare.
     * @param {string} second - The second value to compare.
     * @param {string} op - The comparison operator. Default is "=".
     * @return {this} - The current object instance.
     */
    on(first: string, second: string, op = "="): this {
        this.wheres.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * Adds a condition to the query using the OR operator.
     *
     * @param {string} first - The first operand of the condition.
     * @param {string} second - The second operand of the condition.
     * @param {string} [op="="] - The operator to use in the condition.
     * @return {this} - The updated query builder object.
     */
    orOn(first: string, second: string, op = "="): this {
        this.ors.push(`${first} ${op} ${second}`);
        return this;
    }

    /**
     * Returns the SQL representation of the query.
     *
     * @return {[string, (string | number | null)[]]} The SQL query and its associated values.
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
