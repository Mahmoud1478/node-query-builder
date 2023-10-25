import ICondition from "./ICondition";
export default interface IJoin extends ICondition {
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
