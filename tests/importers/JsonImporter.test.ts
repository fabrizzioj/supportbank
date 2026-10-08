import { describe, expect, it } from "vitest";
import { JsonImporter } from "../../src/importers/JsonImporter";

describe("JsonImporter", () => {
	const importer = new JsonImporter();

	it("maps JSON fields to records", () => {
		const records = importer.read(
			JSON.stringify([
				{
					Date: "2013-01-01T00:00:00",
					FromAccount: "Jon A",
					ToAccount: "Gergana I",
					Narrative: "Sandbox Help",
					Amount: 2.14,
				},
			]),
		);

		expect(records).toEqual([
			{
				location: "record 1",
				date: "2013-01-01T00:00:00",
				from: "Jon A",
				to: "Gergana I",
				narrative: "Sandbox Help",
				amount: "2.14",
			},
		]);
	});

	it("turns missing or malformed fields into empty text", () => {
		const [record] = importer.read(JSON.stringify([null]));
		expect(record?.from).toBe("");
		expect(record?.amount).toBe("");
	});

	it("rejects JSON that is not an array", () => {
		expect(() => importer.read("{}")).toThrow(
			"expected a JSON array of transactions",
		);
	});
});
