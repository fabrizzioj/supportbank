import { isValid, parse as parseDate } from "date-fns";
import { Transaction } from "../models/Transaction";
import { DATE_FORMAT } from "../utils/dateformat";
import { toPence } from "../utils/money";
import type { CsvRow } from "./CsvReader";

const FIRST_DATA_LINE_NUMBER = 2;

export interface SkippedRow {
	lineNumber: number;
	row: CsvRow;
	reason: string;
}

export interface ParseResult {
	transactions: Transaction[];
	skipped: SkippedRow[];
}

export class TransactionParser {
	parse(rows: CsvRow[]): ParseResult {
		const result: ParseResult = { transactions: [], skipped: [] };

		rows.forEach((row, index) => {
			try {
				result.transactions.push(this.parseRow(row));
			} catch (error) {
				result.skipped.push({
					lineNumber: index + FIRST_DATA_LINE_NUMBER,
					row,
					reason: error instanceof Error ? error.message : String(error),
				});
			}
		});

		return result;
	}

	private parseRow(row: CsvRow): Transaction {
		if (!row.From || !row.To) {
			throw new Error("missing From or To");
		}
		const date = parseDate(row.Date, DATE_FORMAT, new Date());
		if (!isValid(date)) {
			throw new Error(`invalid date "${row.Date}"`);
		}
		return new Transaction(
			date,
			row.From,
			row.To,
			row.Narrative,
			toPence(row.Amount),
		);
	}
}
