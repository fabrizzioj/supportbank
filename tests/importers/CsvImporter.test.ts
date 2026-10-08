import { describe, expect, it } from "vitest";
import { CsvImporter } from "../../src/importers/CsvImporter";

describe("CsvImporter", () => {
	it("maps rows to records with CSV line numbers", () => {
		const records = new CsvImporter().read(
			"Date,From,To,Narrative,Amount\n01/01/2014,Jon A,Sarah T,Pokemon Training,7.8\n",
		);

		expect(records).toEqual([
			{
				location: "line 2",
				date: "01/01/2014",
				from: "Jon A",
				to: "Sarah T",
				narrative: "Pokemon Training",
				amount: "7.8",
			},
		]);
	});
});
