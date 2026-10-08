import { join } from "path";
import { describe, expect, it } from "vitest";
import { TransactionLoader } from "../../src/services/TransactionLoader";

describe("TransactionLoader", () => {
	it("loads a CSV file end to end", () => {
		const { transactions, skipped } = new TransactionLoader().load(
			join(process.cwd(), "tests", "fixtures", "sample.csv"),
		);
		expect(transactions).toHaveLength(2);
		expect(skipped).toEqual([]);
	});
});
