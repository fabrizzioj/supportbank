import { parse } from "csv-parse/sync";
import { DATE_FORMAT } from "../utils/dateformat";
import type { FileImporter, RawRecord } from "./FileImporter";

const FIRST_DATA_LINE_NUMBER = 2;

type CsvRow = Partial<
	Record<"Date" | "From" | "To" | "Narrative" | "Amount", string>
>;

export class CsvImporter implements FileImporter {
	readonly dateFormat = DATE_FORMAT;

	read(content: string): RawRecord[] {
		const rows = parse(content, {
			columns: true,
			skip_empty_lines: true,
			trim: true,
			relax_column_count: true,
		}) as CsvRow[];

		return rows.map((row, index) => ({
			location: `line ${index + FIRST_DATA_LINE_NUMBER}`,
			date: row.Date ?? "",
			from: row.From ?? "",
			to: row.To ?? "",
			narrative: row.Narrative ?? "",
			amount: row.Amount ?? "",
		}));
	}
}
