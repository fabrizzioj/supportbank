import { describe, expect, it } from "vitest";
import type { RawRecord } from "../../src/importers/FileImporter";
import { JsonImporter } from "../../src/importers/JsonImporter";
import { TransactionParser } from "../../src/services/TransactionParser";
import { DATE_FORMAT } from "../../src/utils/dateformat";

const record = (overrides: Partial<RawRecord> = {}): RawRecord => ({
	location: "line 2",
	date: "04/01/2014",
	from: "Stephen S",
	to: "Tim L",
	narrative: "Lunch",
	amount: "4.37",
	...overrides,
});

describe("TransactionParser", () => {
	const parser = new TransactionParser();

	it("parses a record into a Transaction", () => {
		const [t] = parser.parse([record()], "test.csv", DATE_FORMAT).transactions;

		expect(t?.date).toEqual(new Date(2014, 0, 4));
		expect(t?.from).toBe("Stephen S");
		expect(t?.to).toBe("Tim L");
		expect(t?.narrative).toBe("Lunch");
		expect(t?.amountPence).toBe(437);
	});

	it("treats CSV dates as day-first", () => {
		const [t] = parser.parse(
			[record({ date: "13/02/2014" })],
			"test.csv",
			DATE_FORMAT,
		).transactions;
		expect(t?.date).toEqual(new Date(2014, 1, 13));
	});

	it("parses JSON-style ISO dates with the JSON date format", () => {
		const [t] = parser.parse(
			[record({ date: "2013-01-01T00:00:00" })],
			"test.json",
			new JsonImporter().dateFormat,
		).transactions;
		expect(t?.date).toEqual(new Date(2013, 0, 1));
	});

	it("skips invalid records and reports where they are", () => {
		const { transactions, skipped } = parser.parse(
			[
				record(),
				record({ location: "line 3", date: "not a date" }),
				record({ location: "line 4", amount: "abc" }),
				record({ location: "line 5", from: "" }),
			],
			"test.csv",
			DATE_FORMAT,
		);

		expect(transactions).toHaveLength(1);
		expect(skipped.map((s) => s.location)).toEqual([
			"line 3",
			"line 4",
			"line 5",
		]);
		expect(skipped[0]?.reason).toBe(
			'invalid date "not a date" (expected dd/MM/yyyy)',
		);
		expect(skipped[1]?.reason).toBe(
			'invalid amount "abc" (expected a number like 12.34)',
		);
		expect(skipped[2]?.reason).toBe("missing From or To");
	});
});
