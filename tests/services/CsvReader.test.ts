import { join } from "path";
import { describe, expect, it } from "vitest";
import { CsvReader } from "../../src/services/CsvReader";

describe("CsvReader", () => {
    it("reads rows keyed by header", () => {
        const rows = new CsvReader().read(
            join(process.cwd(), "tests", "fixtures", "sample.csv"),
        );

        expect(rows).toHaveLength(2);
        expect(rows[0]).toEqual({
            Date: "01/01/2014",
            From: "Jon A",
            To: "Sarah T",
            Narrative: "Pokemon Training",
            Amount: "7.8",
        });
    });
});
