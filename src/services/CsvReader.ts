import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

export interface CsvRow {
    Date: string;
    From: string;
    To: string;
    Narrative: string;
    Amount: string;
}

export class CsvReader {
    read(filePath: string): CsvRow[] {
        const content = readFileSync(filePath, "utf-8");
        return parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as CsvRow[];
    }
}
