import { describe, expect, it } from "vitest";
import { CsvImporter } from "../../src/importers/CsvImporter";
import { importerFor } from "../../src/importers/importerFor";
import { JsonImporter } from "../../src/importers/JsonImporter";
import { XmlImporter } from "../../src/importers/XmlImporter";

describe("importerFor", () => {
	it("picks the importer from the extension, case-insensitively", () => {
		expect(importerFor("a.csv")).toBeInstanceOf(CsvImporter);
		expect(importerFor("A.JSON")).toBeInstanceOf(JsonImporter);
		expect(importerFor("a.xml")).toBeInstanceOf(XmlImporter);
	});

	it("rejects unsupported file types", () => {
		expect(() => importerFor("a.txt")).toThrow('unsupported file type ".txt"');
		expect(() => importerFor("noext")).toThrow(
			'unsupported file type "(none)"',
		);
	});
});
