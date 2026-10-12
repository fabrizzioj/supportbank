import { isValid, parse as parseDate } from "date-fns";
import { getLogger } from "log4js";
import { Transaction } from "../models/Transaction";
import { DATE_FORMAT } from "../utils/dateformat";
import { toPence } from "../utils/money";
import type { CsvRow } from "./CsvReader";

const logger = getLogger("TransactionParser");

const FIRST_DATA_LINE_NUMBER = 2;

export interface SkippedRow {
	source: string;
	lineNumber: number;
	row: CsvRow;
	reason: string;
}

export interface ParseResult {
	transactions: Transaction[];
	skipped: SkippedRow[];
}

export class TransactionParser {
	parse(rows: CsvRow[], source: string): ParseResult {
		const result: ParseResult = { transactions: [], skipped: [] };

		rows.forEach((row, index) => {
			const lineNumber = index + FIRST_DATA_LINE_NUMBER;
			try {
				result.transactions.push(this.parseRow(row));
			} catch (error) {
				const reason = error instanceof Error ? error.message : String(error);
				logger.warn(`${source} line ${lineNumber}: ${reason}. Row: ${JSON.stringify(row)}`);
				result.skipped.push({ source, lineNumber, row, reason });
			}
		});

		logger.info(
			`${source}: parsed ${result.transactions.length} transactions, skipped ${result.skipped.length} rows`,
		);
		return result;
	}

	private parseRow(row: CsvRow): Transaction {
		if (!row.From || !row.To) {
			throw new Error("missing From or To");
		}
		const date = parseDate(row.Date, DATE_FORMAT, new Date());
		if (!isValid(date)) {
			throw new Error(`invalid date "${row.Date}" (expected ${DATE_FORMAT})`);
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