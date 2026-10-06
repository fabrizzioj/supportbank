import { parse as parseDate, isValid } from "date-fns";
import { Transaction } from "../models/Transaction";
import { toPence } from "../utils/money";
import type { CsvRow } from "./CsvReader";

const DATE_FORMAT = "dd/MM/yyyy";

export class TransactionParser {
    parse(rows: CsvRow[]): Transaction[] {
        return rows.map((row, index) => this.parseRow(row, index + 2));
    }

    private parseRow(row: CsvRow, lineNumber: number): Transaction {
        const date = parseDate(row.Date, DATE_FORMAT, new Date());
        if (!isValid(date)) {
            throw new Error(`Line ${lineNumber}: invalid date "${row.Date}"`);
        }
        return new Transaction(date, row.From, row.To, row.Narrative, toPence(row.Amount));
    }
}
