import { join } from "path";
import { CommandController } from "./controllers/CommandController";
import { Bank } from "./services/Bank";
import { CsvReader } from "./services/CsvReader";
import { TransactionParser } from "./services/TransactionParser";
import { ConsoleView } from "./views/ConsoleView";

const DATA_FILE = join(process.cwd(), "data", "Transactions2014.csv");

function main(): void {
	const rows = new CsvReader().read(DATA_FILE);
	const transactions = new TransactionParser().parse(rows);

	const bank = new Bank();
	bank.applyAll(transactions);

	new CommandController(bank, new ConsoleView()).run();
}

main();
