import DB from "../../index";
import IQuery from "../../@Interfaces/IQuery";
import IJoin from "../../@Interfaces/IJoin";
import ICondition from "../../@Interfaces/ICondition";
import { config } from "dotenv";

beforeAll(function (): void {
    config();
});
describe("join statements", (): void => {
    describe("basics", (): void => {
        it("inner join", (): void => {
            expect(DB.table("testing").join("a", "a.key", "testing.id").toRawSql()).toEqual(
                "select * from testing inner join a on a.key = testing.id"
            );
        });
        it("left join", (): void => {
            expect(DB.table("testing").leftJoin("a", "a.key", "testing.id").toRawSql()).toEqual(
                "select * from testing left join a on a.key = testing.id"
            );
        });
        it("right join", (): void => {
            expect(DB.table("testing").rightJoin("a", "a.key", "testing.id").toRawSql()).toEqual(
                "select * from testing right join a on a.key = testing.id"
            );
        });
    });
    describe("complex", function () {
        it("join with wheres", (): void => {
            expect(
                DB.table("testing")
                    .join("a", function (join: IJoin) {
                        join.on("a.key", "testing.id").where("testing.id", "5", ">");
                    })
                    .toRawSql()
            ).toEqual(
                "select * from testing inner join a on a.key = testing.id and testing.id > 5"
            );
        });
        it("join with or", (): void => {
            expect(
                DB.table("testing")
                    .join("a", function (join: IJoin) {
                        join.on("a.key", "testing.id").orOn("testing.id", "5", ">");
                    })
                    .toRawSql()
            ).toEqual("select * from testing inner join a on a.key = testing.id or testing.id > 5");
        });
        it("join with combine where and or", (): void => {
            expect(
                DB.table("testing")
                    .join("a", function (join: IJoin) {
                        join.where(function (query: ICondition) {
                            query.where("a.key", "testing.id").where("testing.id", "5", ">");
                        }).or("id", 1);
                    })
                    .where("status", 1)
                    .toRawSql()
            ).toEqual(
                "select * from testing inner join a on (a.key = testing.id and testing.id > 5) or id = 1 where status = 1"
            );
        });

        it("inner join select statement", () => {
            expect(
                DB.table("testing")
                    .joinSub(
                        function (query: IQuery) {
                            query.select(["key", "count(*)"]).from("a").groupBy(["key"]);
                        },
                        "a",
                        "a.key",
                        "testing.id"
                    )
                    .where("status", 1)
                    .toRawSql()
            ).toEqual(
                "select * from testing inner join (select key,count(*) from a group by key) as a on a.key = testing.id where status = 1"
            );
        });
        it("left join select statement", () => {
            expect(
                DB.table("testing")
                    .leftJoinSub(
                        function (query: IQuery) {
                            query.select(["key", "count(*)"]).from("a").groupBy(["key"]);
                        },
                        "a",
                        "a.key",
                        "testing.id"
                    )
                    .where("status", 1)
                    .toRawSql()
            ).toEqual(
                "select * from testing left join (select key,count(*) from a group by key) as a on a.key = testing.id where status = 1"
            );
        });

        it("right join select statement", () => {
            expect(
                DB.table("testing")
                    .rightJoinSub(
                        function (query: IQuery) {
                            query.select(["key", "count(*)"]).from("a").groupBy(["key"]);
                        },
                        "a",
                        "a.key",
                        "testing.id"
                    )
                    .where("status", 1)
                    .toRawSql()
            ).toEqual(
                "select * from testing right join (select key,count(*) from a group by key) as a on a.key = testing.id where status = 1"
            );
        });
    });
});
