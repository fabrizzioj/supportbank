import type { Transaction } from "./Transaction";
import {formatPence} from "../utils/money";

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

	get status(): string {
		if (this.balancePence < 0) return "owes";
		if (this.balancePence > 0) return "is owed";
		return "settled";
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
