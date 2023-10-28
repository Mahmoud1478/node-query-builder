import ICondition from "../@Interfaces/ICondition";

export type Driver = {
    placeholder: (counter: number, key: string) => string;
    compile: (object: ICondition) => string;
    strict_order: boolean;
};
export type SQL = [string, (string | number | null)[]];
