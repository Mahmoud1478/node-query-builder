import express, { Application, Request, Response } from "express";

import { env } from "./helpers";
import DB, { IQuery } from "./db";

const App: Application = express();
const port = env("PORT", "3000");

App.listen(port, (): void => {
    console.log(`\nApplication started in http://localhost:${port}`);
});

App.use(express.json());

App.get("/", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories")
        .where(function (query: IQuery) {
            query.where("name", "%mahmoud%", "like");
            query.or("type", 3);
        })
        .selectSub(function (q: IQuery) {
            q.select(["count(*)"])
                .from("aliases")
                .whereColumn("aliases.category_id", "categories.id");
        }, "aliases_count")
        .or("id", 30)
        .join("categories as parent", function(q) {

        })
        .leftJoin("categories as parent", "parent.id", "categories.parent.id")
        .rightJoin("categories as parent", "parent.id", "categories.parent.id");

    const [SQL, BINDING] = query.toSql();
    response.json({
        SQL,
        BINDING,
    });
});

export default App;
