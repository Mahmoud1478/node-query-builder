export default interface ICondition {
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
     * @return {[string , (string|number)[]] }
     */
    toSql: () => [string, (string | number | null)[]];
    /**
     * set the starting of placeholder
     * @param count
     */
    startPlaceholderFrom: (count: number) => this;
    /**
     *  get raw sql combine with binding values
     * @return string
     */
    toRawSql: () => string;
}
