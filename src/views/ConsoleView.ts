import { format } from "date-fns";
import type { Account } from "../models/Account";
import type { Transaction } from "../models/Transaction";
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

	printSkippedRows(count: number, logFile: string): void {
		console.log(
			`Warning: skipped ${count} invalid row(s). See ${logFile} for details.`,
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
