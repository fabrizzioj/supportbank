import { readFileSync } from "fs";
import { getLogger } from "log4js";
import { basename } from "path";
import { importerFor } from "../importers/importerFor";
import { type ParseResult, TransactionParser } from "./TransactionParser";

const logger = getLogger("TransactionLoader");

export class TransactionLoader {
	constructor(private readonly parser = new TransactionParser()) {}

	load(filePath: string): ParseResult {
		const importer = importerFor(filePath);
		logger.info(`Reading ${filePath}`);
		const content = readFileSync(filePath, "utf-8");
		const records = importer.read(content);
		logger.info(`Read ${records.length} records from ${filePath}`);
		return this.parser.parse(records, basename(filePath), importer.dateFormat);
	}
}
