import { describe, expect, it } from "vitest";
import type { CsvRow } from "../../src/services/CsvReader";
import { TransactionParser } from "../../src/services/TransactionParser";

const row = (overrides: Partial<CsvRow> = {}): CsvRow => ({
    Date: "04/01/2014",
    From: "Stephen S",
    To: "Tim L",
    Narrative: "Lunch",
    Amount: "4.37",
    ...overrides,
});

describe("TransactionParser", () => {
    const parser = new TransactionParser();

    it("parses a row into a Transaction", () => {
        const [t] = parser.parse([row()]);

        expect(t?.date).toEqual(new Date(2014, 0, 4));
        expect(t?.from).toBe("Stephen S");
        expect(t?.to).toBe("Tim L");
        expect(t?.narrative).toBe("Lunch");
        expect(t?.amountPence).toBe(437);
    });

    it("treats dates as day-first", () => {
        const [t] = parser.parse([row({ Date: "13/02/2014" })]);
        expect(t?.date).toEqual(new Date(2014, 1, 13));
    });

    it("reports the CSV line number for an invalid date", () => {
        expect(() =>
            parser.parse([row(), row({ Date: "not a date" })]),
        ).toThrow('Line 3: invalid date "not a date"');
    });
});
