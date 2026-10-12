import { Account } from "../models/Account";
import type { Transaction } from "../models/Transaction";
import { getLogger } from "log4js";

const logger = getLogger("Bank");

export class Bank {
	private readonly accounts = new Map<string, Account>();

	applyAll(transactions: Transaction[]): void {
		transactions.forEach((t) => this.apply(t));
	}

	apply(transaction: Transaction): void {
		this.getOrCreateAccount(transaction.from).debit(transaction);
		this.getOrCreateAccount(transaction.to).credit(transaction);
	}

	getAccount(name: string): Account | undefined {
		return this.accounts.get(name.toLowerCase());
	}

	getAllAccounts(): Account[] {
		return [...this.accounts.values()];
	}

	private getOrCreateAccount(name: string): Account {
		const key = name.toLowerCase();
		let account = this.accounts.get(key);
		if (!account) {
			account = new Account(name);
			this.accounts.set(key, account);
			logger.debug(`Created account for "${name}"`);
		}
		return account;
	}
}
