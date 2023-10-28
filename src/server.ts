import express, { Application, Request, Response } from "express";
import IQuery from "./@Interfaces/IQuery";
import { env } from "./helpers";
import DB from "./index";
import { config } from "dotenv";

const App: Application = express();
const port: string = env("PORT", "3000");
config();

App.listen(port, (): void => {
    console.log(`\nApplication started in http://localhost:${port}`);
});

App.use(express.json());

App.get("/", function ($request: Request, response: Response) {
    response.json(
        DB.table("testing")
            .where(
                function (query: IQuery) {
                    query
                        .select(["count(*)"])
                        .from("a")
                        .where("name", "mahmoud")
                        .or("name", "mostafa");
                },
                "5",
                ">"
            )
            .where("status", 1)
            .toRawSql()
    );
});

App.get("/select", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories")
        .where(function (query: IQuery) {
            query.where("name", "%mahmoud%", "like");
            query.or("type", 3);
        })
        .or("id", 30);

    // const [SQL, BINDING] = query.toSql();
    response.json(query.toRawSql());
    // response.json({
    //     SQL,
    //     BINDING,
    // });
});
App.get("/insert", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories").insert({
        name: "mahmoud",
        parent_id: 3,
    });
    // const [SQL, BINDING] = query.toSql();
    response.json(query.toRawSql());
});

App.get("/update", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories")

        .where("name", "mahmoud")
        .update({
            parent_id: 4,
        });
    const [SQL, BINDING] = query.toSql();
    response.json({
        SQL,
        BINDING,
        raw: query.toRawSql(),
    });
});

App.get("/delete", function ($request: Request, response: Response) {
    const query: IQuery = DB.table("categories").where("name", "mahmoud").delete();
    // const [SQL, BINDING] = query.toSql();
    response.json(query.toRawSql());
});
export default App;
