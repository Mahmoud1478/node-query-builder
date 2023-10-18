import DB, { IQuery } from "../../db";

describe("select statements", (): void => {
    describe("basics", (): void => {
        it("auto select all", (): void => {
            expect(DB.table("testing").toRawSql()).toEqual("select * from testing");
        });
        it("select all ", (): void => {
            expect(DB.table("testing").select(["*"]).toRawSql()).toEqual("select * from testing");
        });
        it("select some columns ", (): void => {
            expect(DB.table("testing").select(["name", "password"]).toRawSql()).toEqual(
                "select name,password from testing"
            );
        });
        it("select some columns with sub select query", (): void => {
            expect(
                DB.table("testing")
                    .select(["name", "password"])
                    .selectSub(function (query: IQuery) {
                        query
                            .select(["count(*)"])
                            .from("testing2")
                            .whereColumn("testing2.col1", "testing.col2");
                    })
                    .toRawSql()
            ).toEqual(
                "select name,password,(select count(*) from testing2 where testing2.col1 = testing.col2) from testing"
            );
        });
        it("select all with simple where condition ", (): void => {
            expect(DB.table("testing").where("name", "mahmoud").toRawSql()).toEqual(
                "select * from testing where name = mahmoud"
            );
        });
        it("select all with simple where and or condition ", (): void => {
            expect(DB.table("testing").where("name", "mahmoud").or("id", 1).toRawSql()).toEqual(
                "select * from testing where name = mahmoud or id = 1"
            );
        });
        it("select all with simple where in condition ", (): void => {
            expect(DB.table("testing").whereIn("id", [1, 2, 3, 4, 5]).toRawSql()).toEqual(
                "select * from testing where id in(1,2,3,4,5)"
            );
        });
        it("select all with simple where not in condition ", (): void => {
            expect(DB.table("testing").whereNotIn("id", [1, 2, 3, 4, 5]).toRawSql()).toEqual(
                "select * from testing where id not in(1,2,3,4,5)"
            );
        });
        it("select all with complex where condition ", (): void => {
            expect(
                DB.table("testing")
                    .where(function (query: IQuery) {
                        query.where("name", "mahmoud").or("name", "mostafa");
                    })
                    .where("status", 1)
                    .toRawSql()
            ).toEqual(
                "select * from testing where (name = mahmoud or name = mostafa) and status = 1"
            );
        });
    });
});
