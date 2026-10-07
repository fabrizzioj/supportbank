import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { getLogger } from "log4js";

const logger = getLogger("CsvReader");

export interface CsvRow {
	Date: string;
	From: string;
	To: string;
	Narrative: string;
	Amount: string;
}

export class CsvReader {
	read(filePath: string): CsvRow[] {
		logger.info(`Reading ${filePath}`);
		const content = readFileSync(filePath, "utf-8");
		const rows = parse(content, {
			columns: true,
			skip_empty_lines: true,
			trim: true,
			relax_column_count: true,
		}) as CsvRow[];
		logger.info(`Read ${rows.length} rows from ${filePath}`);
		return rows;
	}
}
