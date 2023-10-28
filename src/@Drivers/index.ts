import { Driver } from "../@types";
import ICondition from "../@Interfaces/ICondition";

const drivers: Record<string, Driver> = {
    pg: {
        placeholder: (counter: number, key: string): string => {
            return `$${counter}`;
        },
        compile: (object: ICondition) => {
            const [q, v] = object.toSql();
            let y: string = q;
            v.forEach((item: string | number | null, idx: number): void => {
                y = y.replace(`$${idx + 1}`, item as string);
            });
            return y;
        },
        strict_order: false,
    },
    mysql: {
        compile: (object: ICondition) => {
            const [q, v] = object.toSql();
            let y: string = q;
            v.forEach((item: string | number | null, idx: number): void => {
                y = y.replace("?", item as string);
            });
            return y;
        },
        placeholder: (counter: number, key: string): string => {
            return `?`;
        },
        strict_order: true,
    },
    // sqlite: {},
};

export default drivers;
