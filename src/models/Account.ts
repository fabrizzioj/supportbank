import { formatPence } from "../utils/money";
import { AccountStatus } from "./AccountStatus";
import type { Transaction } from "./Transaction";

export class Account {
	private balancePence = 0;
	private readonly transactions: Transaction[] = [];

	constructor(public readonly name: string) {}

	get balance(): number {
		return this.balancePence;
	}

	get history(): readonly Transaction[] {
		return this.transactions;
	}

	get status(): AccountStatus {
		if (this.balancePence < 0) return AccountStatus.Owes;
		if (this.balancePence > 0) return AccountStatus.IsOwed;
		return AccountStatus.Settled;
	}

	credit(transaction: Transaction): void {
		this.balancePence += transaction.amountPence;
		this.transactions.push(transaction);
	}

	debit(transaction: Transaction): void {
		this.balancePence -= transaction.amountPence;
		this.transactions.push(transaction);
	}

	toString(): string {
		return `${this.name}: ${formatPence(this.balancePence)} (${this.status})`;
	}
}
