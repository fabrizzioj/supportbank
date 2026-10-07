import { join } from "path";
import { CommandController } from "./controllers/CommandController";
import { Bank } from "./services/Bank";
import { CsvReader } from "./services/CsvReader";
import { Logger } from "./services/Logger";
import { TransactionParser } from "./services/TransactionParser";
import { ConsoleView } from "./views/ConsoleView";

const DATA_FILE = join(process.cwd(), "data", "Transactions2014.csv");
const LOG_FILE = join(process.cwd(), "logs", "supportbank.log");

function loadBank(logger: Logger, view: ConsoleView): Bank {
	logger.info(`Loading ${DATA_FILE}`);
	const rows = new CsvReader().read(DATA_FILE);
	const { transactions, skipped } = new TransactionParser().parse(rows);

	for (const s of skipped) {
		logger.warn(`Skipped line ${s.lineNumber}: ${s.reason} ${JSON.stringify(s.row)}`);
	}
	if (skipped.length > 0) {
		view.printSkippedRows(skipped.length, LOG_FILE);
	}

	const bank = new Bank();
	bank.applyAll(transactions);
	logger.info(`Loaded ${transactions.length} transactions`);
	return bank;
}

function main(): void {
	const logger = new Logger(LOG_FILE);
	const view = new ConsoleView();

	let bank: Bank;
	try {
		bank = loadBank(logger, view);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logger.error(`Failed to load ${DATA_FILE}: ${message}`);
		view.printError(`Could not load transactions: ${message}`);
		process.exitCode = 1;
		return;
	}

	new CommandController(bank, view).run();
}

main();