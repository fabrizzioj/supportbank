import { basename, join } from "path";
import { getLogger } from "log4js";
import { keyInYNStrict } from "readline-sync";
import { CommandController } from "./controllers/CommandController";
import { configureLogging } from "./logging";
import type { Transaction } from "./models/Transaction";
import { Bank } from "./services/Bank";
import { CsvReader } from "./services/CsvReader";
import { type SkippedRow, TransactionParser } from "./services/TransactionParser";
import { ConsoleView } from "./views/ConsoleView";

const DATA_FILES = ["Transactions2014.csv", "DodgyTransactions2015.csv"].map((file) =>
	join(process.cwd(), "data", file),
);

const logger = getLogger("index");

interface LoadResult {
	transactions: Transaction[];
	skipped: SkippedRow[];
	failedFiles: string[];
}

function loadTransactions(view: ConsoleView): LoadResult {
	const reader = new CsvReader();
	const parser = new TransactionParser();
	const result: LoadResult = { transactions: [], skipped: [], failedFiles: [] };

	for (const file of DATA_FILES) {
		const fileName = basename(file);
		try {
			const parsed = parser.parse(reader.read(file), fileName);
			result.transactions.push(...parsed.transactions);
			result.skipped.push(...parsed.skipped);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			logger.error(`Could not load ${file}`, error);
			view.printFileError(fileName, message);
			result.failedFiles.push(fileName);
		}
	}

	return result;
}

function confirmPartialImport(result: LoadResult, view: ConsoleView): boolean {
	if (result.skipped.length === 0 && result.failedFiles.length === 0) {
		return true;
	}
	if (result.skipped.length > 0) {
		view.printSkippedRows(result.skipped);
	}

	const proceed = keyInYNStrict(
		`Import the ${result.transactions.length} valid transactions anyway?`,
	);
	logger.info(`User ${proceed ? "accepted" : "declined"} partial import`);
	return proceed;
}

function main(): void {
	configureLogging();
	logger.info("SupportBank starting");

	const view = new ConsoleView();
	const result = loadTransactions(view);

	if (!confirmPartialImport(result, view)) {
		view.printImportCancelled();
		process.exitCode = 1;
		logger.info("SupportBank shutting down: import cancelled by user");
		return;
	}

	const bank = new Bank();
	bank.applyAll(result.transactions);
	const accountCount = bank.getAllAccounts().length;
	logger.info(`Loaded ${result.transactions.length} transactions into ${accountCount} accounts`);

	new CommandController(bank, view).run();
	logger.info("SupportBank shutting down");
}

main();
