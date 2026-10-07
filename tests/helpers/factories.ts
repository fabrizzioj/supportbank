import { vi } from "vitest";
import { Transaction } from "../../src/models/Transaction";
import type { ConsoleView } from "../../src/views/ConsoleView";

interface TransactionFields {
    date: Date;
    from: string;
    to: string;
    narrative: string;
    amountPence: number;
}

export function makeTransaction(
    overrides: Partial<TransactionFields> = {},
): Transaction {
    const t: TransactionFields = {
        date: new Date(2014, 0, 1),
        from: "Jon A",
        to: "Sarah T",
        narrative: "Lunch",
        amountPence: 780,
        ...overrides,
    };
    return new Transaction(t.date, t.from, t.to, t.narrative, t.amountPence);
}

export function makeFakeView() {
    const fake = {
        printAllAccounts: vi.fn(),
        printAccountHistory: vi.fn(),
        printAccountNotFound: vi.fn(),
        printHelp: vi.fn(),
        printUnknownCommand: vi.fn(),
    };
    return { fake, view: fake as unknown as ConsoleView };
}
