import DB, { IQuery } from "../../db";

describe("select statements", (): void => {
    describe("basics", (): void => {
        it("auto select all", (): void => {
            expect(DB.table("testing").toRawSql()).toEqual("select * from testing");
        });
        it("select all ", (): void => {
            expect(DB.table("testing").select(["*"]).toRawSql()).toEqual("select * from testing");
        });
        it("select some columns", (): void => {
            expect(DB.table("testing").select(["name", "password"]).toRawSql()).toEqual(
                "select name,password from testing"
            );
        });
    });
    describe("complex", function () {
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
    });
});
