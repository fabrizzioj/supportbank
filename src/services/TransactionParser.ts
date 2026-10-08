import { isValid, parse as parseDate } from "date-fns";
import { getLogger } from "log4js";
import type { RawRecord } from "../importers/FileImporter";
import { Transaction } from "../models/Transaction";
import { toPence } from "../utils/money";

const logger = getLogger("TransactionParser");

export interface SkippedRow {
	source: string;
	location: string;
	record: RawRecord;
	reason: string;
}

export interface ParseResult {
	transactions: Transaction[];
	skipped: SkippedRow[];
}

export class TransactionParser {
	parse(records: RawRecord[], source: string, dateFormat: string): ParseResult {
		const result: ParseResult = { transactions: [], skipped: [] };

		for (const record of records) {
			try {
				result.transactions.push(this.parseRecord(record, dateFormat));
			} catch (error) {
				const reason = error instanceof Error ? error.message : String(error);
				logger.warn(
					`${source} ${record.location}: ${reason}. Record: ${JSON.stringify(record)}`,
				);
				result.skipped.push({
					source,
					location: record.location,
					record,
					reason,
				});
			}
		}

		logger.info(
			`${source}: parsed ${result.transactions.length} transactions, skipped ${result.skipped.length} records`,
		);
		return result;
	}

	private parseRecord(record: RawRecord, dateFormat: string): Transaction {
		if (!record.from || !record.to) {
			throw new Error("missing From or To");
		}
		const date = parseDate(record.date, dateFormat, new Date());
		if (!isValid(date)) {
			throw new Error(`invalid date "${record.date}" (expected ${dateFormat})`);
		}
		return new Transaction(
			date,
			record.from,
			record.to,
			record.narrative,
			toPence(record.amount),
		);
	}
}
