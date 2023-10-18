import { Pool } from "pg";
import dotenv from "dotenv";
import { env } from "./helpers";

dotenv.config();

const dbMap: Record<string, string> = {
    test: "TEST_",
    dev: "DEV_",
    pro: "PRO_",
};
const prefix = dbMap[process.env.ENV as string];

// const db = new Pool({
//     host: process.env[`${prefix}DATABASE_HOST`],
//     user: process.env[`${prefix}DATABASE_USER`],
//     password: process.env[`${prefix}DATABASE_PASSWORD`],
//     database: process.env[`${prefix}DATABASE_NAME`],
//     port: parseInt(process.env[`${prefix}DATABASE_PORT`] as string) as number,
// });
const db = new Pool({
    host: env(`${prefix}DATABASE_HOST`),
    user: env(`${prefix}DATABASE_USER`),
    password: env(`${prefix}DATABASE_PASSWORD`),
    database: env(`${prefix}DATABASE_NAME`),
    port: parseInt(env(`${prefix}DATABASE_PORT`)),
});

export default db;
