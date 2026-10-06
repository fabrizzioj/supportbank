import { Transaction } from "./Transaction";

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

    credit(transaction: Transaction): void {
        this.balancePence += transaction.amountPence;
        this.transactions.push(transaction);
    }

    debit(transaction: Transaction): void {
        this.balancePence -= transaction.amountPence;
        this.transactions.push(transaction);
    }
}
