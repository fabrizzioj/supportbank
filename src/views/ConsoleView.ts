import { format } from "date-fns";
import type { Account } from "../models/Account";
import type { Transaction } from "../models/Transaction";
import type { SkippedRow } from "../services/TransactionParser";
import { DATE_FORMAT } from "../utils/dateformat";
import { formatPence } from "../utils/money";
import { type Column, formatTable } from "./table";

const ACCOUNT_COLUMNS: Column<Account>[] = [
	{ header: "Name", value: (a) => a.name },
	{ header: "Balance", value: (a) => formatPence(a.balance), align: "right" },
	{ header: "Status", value: (a) => a.status },
];

const HELP_INDENT = "  ";

const COMMANDS = [
	{ usage: "List All", description: "show every account and its balance" },
	{ usage: "List <Name>", description: "show all transactions for an account" },
	{
		usage: "Import File [name]",
		description:
			"import a .csv, .json or .xml file from the data folder (leave out the name to pick from a list)",
	},
	{ usage: "Help", description: "show this list of commands" },
	{ usage: "Exit", description: "quit" },
];

export class ConsoleView {
	printAllAccounts(accounts: Account[]): void {
		const sorted = [...accounts].sort((a, b) => a.name.localeCompare(b.name));
		console.log(formatTable(ACCOUNT_COLUMNS, sorted));
	}

	printAccountHistory(account: Account): void {
		console.log(`Transactions for ${account.toString()}`);
		console.log(formatTable(this.transactionColumns(account), account.history));
	}

	printAccountNotFound(name: string): void {
		console.log(`No account found for "${name}".`);
	}

	printHelp(): void {
		const width = Math.max(...COMMANDS.map((c) => c.usage.length));
		console.log("Commands:");
		for (const c of COMMANDS) {
			console.log(this.formatCommand(c.usage, c.description, width));
		}
	}

	printUnknownCommand(input: string): void {
		console.log(
			`Unknown command: "${input}". Type "Help" for a list of commands.`,
		);
	}

	printSkippedRows(skipped: readonly SkippedRow[]): void {
		console.log(`${skipped.length} record(s) could not be imported:`);
		for (const s of skipped) {
			console.log(`  ${s.source}, ${s.location}: ${s.reason}`);
		}
	}

	printImportCancelled(fileName: string): void {
		console.log(
			`Nothing was imported from ${fileName}. Please correct the records listed above and import it again.`,
		);
	}

	printImported(fileName: string, count: number): void {
		console.log(`Imported ${count} transactions from ${fileName}.`);
	}

	printAlreadyImported(fileName: string): void {
		console.log(`${fileName} has already been imported. Skipping it.`);
	}

	printNoImportableFiles(folder: string): void {
		console.log(`No .csv, .json or .xml files found in ${folder}.`);
	}

	printFileError(fileName: string, message: string): void {
		console.error(
			`Could not read ${fileName}: ${message}. No transactions were imported from it.`,
		);
	}

	printError(message: string): void {
		console.error(`Error: ${message}`);
	}

	private transactionColumns(account: Account): Column<Transaction>[] {
		const isOutgoing = (t: Transaction): boolean =>
			t.from.toLowerCase() === account.name.toLowerCase();

		return [
			{ header: "Date", value: (t) => format(t.date, DATE_FORMAT) },
			{ header: "From", value: (t) => t.from },
			{ header: "To", value: (t) => t.to },
			{
				header: "Amount",
				value: (t) =>
					formatPence(isOutgoing(t) ? -t.amountPence : t.amountPence),
				align: "right",
			},
			{ header: "Narrative", value: (t) => t.narrative },
		];
	}

	private formatCommand(
		usage: string,
		description: string,
		width: number,
	): string {
		return `${HELP_INDENT}${usage.padEnd(width)}  - ${description}`;
	}
}
