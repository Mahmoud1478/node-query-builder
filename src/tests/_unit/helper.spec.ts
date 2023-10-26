import { env } from "../../helpers";
import { config } from "dotenv";

beforeAll(function (): void {
    config();
});

describe("helper functions", function () {
    it("should get environment type from shell", () => {
        expect(env("ENV")).toEqual("test");
    });
    it("should get database host form .env file", () => {
        expect(env("DB_HOST")).toEqual("localhost");
    });
    it("should get database driver form .env file", () => {
        expect(env("DB_DRIVER")).toEqual("pg");
    });
    it("should get database user form .env file", () => {
        expect(env("DB_USER")).toEqual("root");
    });
    it("should get database password form .env file", () => {
        expect(env("DB_PASSWORD")).toEqual("");
    });
    it("should get database port form .env file", () => {
        expect(env("DB_PORT")).toEqual("5432");
    });
});
