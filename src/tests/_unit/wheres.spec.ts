import DB from "../../index";
import IQuery from "../../@Interfaces/IQuery";
describe("where statements", (): void => {
    describe("basics", (): void => {
        it("simple where condition ", (): void => {
            expect(DB.table("testing").where("name", "mahmoud").toRawSql()).toEqual(
                "select * from testing where name = mahmoud"
            );
        });
        it("simple where and or condition ", (): void => {
            expect(DB.table("testing").where("name", "mahmoud").or("id", 1).toRawSql()).toEqual(
                "select * from testing where name = mahmoud or id = 1"
            );
        });
        it("simple where in condition ", (): void => {
            expect(DB.table("testing").whereIn("id", [1, 2, 3, 4, 5]).toRawSql()).toEqual(
                "select * from testing where id in(1,2,3,4,5)"
            );
        });
        it("simple where not in condition ", (): void => {
            expect(DB.table("testing").whereNotIn("id", [1, 2, 3, 4, 5]).toRawSql()).toEqual(
                "select * from testing where id not in(1,2,3,4,5)"
            );
        });
    });

    describe("complex", function () {
        it("combine where condition", (): void => {
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
        it("where in with sub select", (): void => {
            expect(
                DB.table("testing")
                    .whereIn("name", function (query: IQuery) {
                        query.select(["name"]).from("testing2").where("status", 1);
                    })
                    .toRawSql()
            ).toEqual(
                "select * from testing where name in(select name from testing2 where status = 1)"
            );
        });
        it("where not in with sub select", (): void => {
            expect(
                DB.table("testing")
                    .whereNotIn("name", function (query: IQuery) {
                        query.select(["name"]).from("testing2").where("status", 0);
                    })
                    .toRawSql()
            ).toEqual(
                "select * from testing where name not in(select name from testing2 where status = 0)"
            );
        });
        it("where exists condition", (): void => {
            expect(
                DB.table("testing")
                    .whereExists(function (query: IQuery) {
                        query.select(["name"]).from("testing2").where("status", 1);
                    })
                    .toRawSql()
            ).toEqual(
                "select * from testing where exists(select name from testing2 where status = 1)"
            );
        });

        it("where not exists condition", (): void => {
            expect(
                DB.table("testing")
                    .whereNotExist(function (query: IQuery) {
                        query
                            .select(["*"])
                            .from("testing2")
                            .whereColumn("testing.a", "testing2.b")
                            .where("status", 0);
                    })
                    .toRawSql()
            ).toEqual(
                "select * from testing where not exists(select * from testing2 where testing.a = testing2.b and status = 0)"
            );
        });
        it("where not exists condition with Query object", (): void => {
            expect(
                DB.table("testing")
                    .whereNotExist(
                        DB.table("testing2")
                            .whereColumn("testing.a", "testing2.b")
                            .where("status", 0)
                    )
                    .toRawSql()
            ).toEqual(
                "select * from testing where not exists(select * from testing2 where testing.a = testing2.b and status = 0)"
            );
        });
        it("where not exists with another conditions", (): void => {
            expect(
                DB.table("testing")
                    .whereNotExist(function (query: IQuery) {
                        query.select(["name"]).from("testing2").where("status", 0);
                    })
                    .where("id", "30", ">")
                    .toRawSql()
            ).toEqual(
                "select * from testing where not exists(select name from testing2 where status = 0) and id > 30"
            );
        });
    });
});
