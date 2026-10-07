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
        const [t] = parser.parse([row()], "test.csv").transactions;

		expect(t?.date).toEqual(new Date(2014, 0, 4));
		expect(t?.from).toBe("Stephen S");
		expect(t?.to).toBe("Tim L");
		expect(t?.narrative).toBe("Lunch");
		expect(t?.amountPence).toBe(437);
	});

    it("treats dates as day-first", () => {
        const [t] = parser.parse([row({ Date: "13/02/2014" })], "test.csv").transactions;
        expect(t?.date).toEqual(new Date(2014, 1, 13));
    });

    it("skips invalid rows and reports their line numbers", () => {
        const { transactions, skipped } = parser.parse([
            row(),
            row({ Date: "not a date" }),
            row({ Amount: "abc" }),
            row({ From: "" }),
        ], "test.csv");

        expect(transactions).toHaveLength(1);
        expect(skipped.map((s) => s.lineNumber)).toEqual([3, 4, 5]);
        expect(skipped[0]?.reason).toBe('invalid date "not a date" (expected dd/MM/yyyy)');
        expect(skipped[1]?.reason).toBe('invalid amount "abc" (expected a number like 12.34)');
        expect(skipped[2]?.reason).toBe("missing From or To");
    });

    it("rejects the dodgy rows from the 2015 file", () => {
        const { skipped } = parser.parse(
            [
                row({ Amount: "One Cheeseburger" }),
                row({ Date: "Last Thursday" }),
            ],
            "DodgyTransactions2015.csv",
        );

        expect(skipped.map((s) => s.reason)).toEqual([
            'invalid amount "One Cheeseburger" (expected a number like 12.34)',
            'invalid date "Last Thursday" (expected dd/MM/yyyy)',
        ]);
    });
});
