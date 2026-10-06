import { format } from "date-fns";
import type { Account } from "../models/Account";
import type { Transaction } from "../models/Transaction";
import { DATE_FORMAT } from "../utils/dateformat";
import { formatPence } from "../utils/money";

export class ConsoleView {
	printAllAccounts(accounts: Account[]): void {
		const sorted = [...accounts].sort((a, b) => a.name.localeCompare(b.name));
		const nameWidth = Math.max(...sorted.map((a) => a.name.length), 4);

		console.log(`${"Name".padEnd(nameWidth)}  Balance     Status`);
		console.log("-".repeat(nameWidth + 28));
		sorted.forEach((account) => {
			console.log(
				`${account.name.padEnd(nameWidth)}  ${formatPence(account.balance).padStart(10)}  ${this.status(account.balance)}`,
			);
		});
	}

	printAccountHistory(account: Account): void {
		console.log(
			`Transactions for ${account.name} (balance ${formatPence(account.balance)}):`,
		);
		account.history.forEach((t) =>
			console.log(this.formatTransaction(t, account)),
		);
	}

	printAccountNotFound(name: string): void {
		console.log(`No account found for "${name}".`);
	}

	printHelp(): void {
		console.log("Commands:");
		console.log("  List All        - show every account and its balance");
		console.log("  List <Name>     - show all transactions for an account");
		console.log("  Exit            - quit");
	}

	printUnknownCommand(input: string): void {
		console.log(
			`Unknown command: "${input}". Type "Help" for a list of commands.`,
		);
	}

	private formatTransaction(t: Transaction, account: Account): string {
		const isOutgoing = t.from.toLowerCase() === account.name.toLowerCase();
		const amount = formatPence(isOutgoing ? -t.amountPence : t.amountPence);
		const counterparty = isOutgoing ? `to ${t.to}` : `from ${t.from}`;
		return `${format(t.date, DATE_FORMAT)}  ${amount.padStart(9)}  ${counterparty.padEnd(16)}  ${t.narrative}`;
	}

	private status(balance: number): string {
		if (balance < 0) return "owes";
		if (balance > 0) return "is owed";
		return "settled";
	}
}
