import { beforeEach, describe, expect, it } from "vitest";
import { Bank } from "../../src/services/Bank";
import { makeTransaction } from "../helpers/factories";

describe("Bank", () => {
    let bank: Bank;

    beforeEach(() => {
        bank = new Bank();
    });

    it("debits the payer and credits the payee", () => {
        bank.apply(makeTransaction({ from: "Jon A", to: "Sarah T", amountPence: 780 }));

        expect(bank.getAccount("Jon A")?.balance).toBe(-780);
        expect(bank.getAccount("Sarah T")?.balance).toBe(780);
    });

    it("creates one account per unique name", () => {
        bank.applyAll([
            makeTransaction({ from: "Jon A", to: "Sarah T" }),
            makeTransaction({ from: "Sarah T", to: "Jon A" }),
        ]);

        expect(bank.getAllAccounts()).toHaveLength(2);
    });

    it("records the transaction on both accounts", () => {
        const t = makeTransaction();
        bank.apply(t);

        expect(bank.getAccount("Jon A")?.history).toEqual([t]);
        expect(bank.getAccount("Sarah T")?.history).toEqual([t]);
    });

    it("looks up accounts case-insensitively", () => {
        bank.apply(makeTransaction({ from: "Jon A" }));

        expect(bank.getAccount("jon a")?.name).toBe("Jon A");
    });

    it("returns undefined for unknown accounts", () => {
        expect(bank.getAccount("Nobody")).toBeUndefined();
    });
});
