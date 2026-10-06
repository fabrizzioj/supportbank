import { join } from "path";
import { CsvReader } from "./services/CsvReader";
import { TransactionParser } from "./services/TransactionParser";
import { Bank } from "./services/Bank";
import { formatPence } from "./utils/money";

const rows = new CsvReader().read(join(process.cwd(), "data", "Transactions2014.csv"));
const bank = new Bank();
bank.applyAll(new TransactionParser().parse(rows));
bank.getAllAccounts().forEach((a) => console.log(a.name, formatPence(a.balance)));
