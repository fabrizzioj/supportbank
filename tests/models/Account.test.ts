import { describe, expect, it } from "vitest";
import { Account } from "../../src/models/Account";
import { AccountStatus } from "../../src/models/AccountStatus";
import { makeTransaction } from "../helpers/factories";

describe("Account", () => {
	it("toString summarises name, balance and status", () => {
		const account = new Account("Jon A");
		account.debit(makeTransaction({ amountPence: 780 }));
		expect(account.toString()).toBe("Jon A: -£7.80 (owes)");
	});

	it("reports status from the balance", () => {
		const owes = new Account("A");
		owes.debit(makeTransaction({ amountPence: 100 }));
		const isOwed = new Account("B");
		isOwed.credit(makeTransaction({ amountPence: 100 }));

		expect(owes.status).toBe(AccountStatus.Owes);
		expect(isOwed.status).toBe(AccountStatus.IsOwed);
		expect(new Account("C").status).toBe(AccountStatus.Settled);
	});
});
