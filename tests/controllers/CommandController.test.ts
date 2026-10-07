import { beforeEach, describe, expect, it } from "vitest";
import { CommandController } from "../../src/controllers/CommandController";
import { Bank } from "../../src/services/Bank";
import { makeFakeView, makeTransaction } from "../helpers/factories";

describe("CommandController.handle", () => {
    let bank: Bank;
    let fake: ReturnType<typeof makeFakeView>["fake"];
    let controller: CommandController;

    beforeEach(() => {
        bank = new Bank();
        bank.apply(makeTransaction({ from: "Jon A", to: "Sarah T" }));
        const fakes = makeFakeView();
        fake = fakes.fake;
        controller = new CommandController(bank, fakes.view);
    });

    it("List All prints all accounts", () => {
        expect(controller.handle("List All")).toBe(true);
        expect(fake.printAllAccounts).toHaveBeenCalledWith(bank.getAllAccounts());
    });

    it("List <Name> prints that account's history (case-insensitive)", () => {
        controller.handle("list jon a");
        expect(fake.printAccountHistory).toHaveBeenCalledWith(bank.getAccount("Jon A"));
    });

    it("List <Unknown> reports not found", () => {
        controller.handle("List Nobody");
        expect(fake.printAccountNotFound).toHaveBeenCalledWith("Nobody");
    });

    it("handles extra whitespace in names", () => {
        controller.handle("List   Jon   A");
        expect(fake.printAccountHistory).toHaveBeenCalledWith(bank.getAccount("Jon A"));
    });

    it("unknown commands are reported", () => {
        controller.handle("Foo");
        expect(fake.printUnknownCommand).toHaveBeenCalledWith("Foo");
    });

    it("Exit stops the loop", () => {
        expect(controller.handle("Exit")).toBe(false);
    });
});
