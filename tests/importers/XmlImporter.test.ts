import { describe, expect, it } from "vitest";
import { XmlImporter } from "../../src/importers/XmlImporter";

const xml = (transactions: string): string =>
	`<?xml version="1.0" encoding="utf-8"?><TransactionList>${transactions}</TransactionList>`;

describe("XmlImporter", () => {
	const importer = new XmlImporter();

	it("maps nested elements and converts Excel serial dates", () => {
		const records = importer.read(
			xml(`
				<SupportTransaction Date="40909">
					<Description>Snooker Night</Description>
					<Value>9.22</Value>
					<Parties>
						<From>Gergana I</From>
						<To>Jon A</To>
					</Parties>
				</SupportTransaction>`),
		);

		expect(records).toEqual([
			{
				location: "record 1",
				date: "01/01/2012",
				from: "Gergana I",
				to: "Jon A",
				narrative: "Snooker Night",
				amount: "9.22",
			},
		]);
	});

	it("returns a list even when there is a single transaction or none", () => {
		expect(importer.read(xml(""))).toEqual([]);
		expect(
			importer.read(xml('<SupportTransaction Date="40910"/>')),
		).toHaveLength(1);
	});

	it("passes non-numeric dates through so the parser can reject them", () => {
		const [record] = importer.read(
			xml('<SupportTransaction Date="yesterday"/>'),
		);
		expect(record?.date).toBe("yesterday");
		expect(record?.from).toBe("");
	});

	it("rejects malformed XML", () => {
		expect(() => importer.read("<TransactionList>")).toThrow(/invalid XML/);
	});
});
