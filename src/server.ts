import express, { Application, Request, Response } from "express";

import { env } from "./helpers";
import DB, { IQuery } from "./db";

const App: Application = express();
const port = env("PORT", "3000");

App.listen(port, (): void => {
    console.log(`\nApplication started in http://localhost:${port}`);
});

App.use(express.json());

App.get("/select", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories")
        .where(function (query: IQuery) {
            query.where("name", "%mahmoud%", "like");
            query.or("type", 3);
        })
        .or("id", 30);

    const [SQL, BINDING] = query.toSql();
    response.json({
        SQL,
        BINDING,
    });
});
App.get("/insert", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories").insert({
        name: "mahmoud",
        parent_id: 3,
    });
    const [SQL, BINDING] = query.toSql();
    response.json({
        SQL,
        BINDING,
    });
});

App.get("/update", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories").where("name", "mahmoud").update({
        parent_id: 4,
    });
    const [SQL, BINDING] = query.toSql();
    response.json({
        SQL,
        BINDING,
    });
});

App.get("/delete", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories").where("name", "mahmoud").delete();
    const [SQL, BINDING] = query.toSql();
    response.json({
        SQL,
        BINDING,
    });
});
export default App;
