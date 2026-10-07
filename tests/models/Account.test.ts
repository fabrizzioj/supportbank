import { describe, expect, it } from "vitest";
import { Account } from "../../src/models/Account";
import { makeTransaction } from "../helpers/factories";

describe("Account", () => {
    it("toString summarises name, balance and status", () => {
        const account = new Account("Jon A");
        account.debit(makeTransaction({ amountPence: 780 }));
        expect(account.toString()).toBe("Jon A: -£7.80 (owes)");
    });
});
