import { join } from "path";
import { Bank } from "./services/Bank";
import { CsvReader } from "./services/CsvReader";
import { TransactionParser } from "./services/TransactionParser";
import { ConsoleView } from "./views/ConsoleView";

const rows = new CsvReader().read(
	join(process.cwd(), "data", "Transactions2014.csv"),
);
const bank = new Bank();
bank.applyAll(new TransactionParser().parse(rows));
const view = new ConsoleView();
view.printAllAccounts(bank.getAllAccounts());
const jon = bank.getAccount("jon a");
if (jon) view.printAccountHistory(jon);
