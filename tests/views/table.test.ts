import { describe, expect, it } from "vitest";
import { formatTable } from "../../src/views/table";

describe("formatTable", () => {
	it("sizes columns to the widest cell and aligns them", () => {
		const output = formatTable(
			[
				{ header: "Name", value: (x: { n: string; v: string }) => x.n },
				{ header: "Val", value: (x) => x.v, align: "right" },
			],
			[
				{ n: "Jonathan", v: "1" },
				{ n: "Al", v: "100" },
			],
		);

		expect(output.split("\n")).toEqual([
			"Name      Val",
			"-------------",
			"Jonathan    1",
			"Al        100",
		]);
	});
});
