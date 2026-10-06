import { question } from "readline-sync";
import type { Bank } from "../services/Bank";
import type { ConsoleView } from "../views/ConsoleView";

export class CommandController {
    constructor(
        private readonly bank: Bank,
        private readonly view: ConsoleView,
    ) {}

    run(): void {
        this.view.printHelp();
        let running = true;
        while (running) {
            running = this.handle(question("> ").trim());
        }
    }

    handle(input: string): boolean {
        const [command = "", ...rest] = input.split(/\s+/);
        const argument = rest.join(" ");

        switch (command.toLowerCase()) {
            case "":
                return true;
            case "list":
                this.list(argument);
                return true;
            case "help":
                this.view.printHelp();
                return true;
            case "exit":
                return false;
            default:
                this.view.printUnknownCommand(input);
                return true;
        }
    }

    private list(argument: string): void {
        if (!argument) {
            this.view.printHelp();
            return;
        }
        if (argument.toLowerCase() === "all") {
            this.view.printAllAccounts(this.bank.getAllAccounts());
            return;
        }
        const account = this.bank.getAccount(argument);
        if (account) {
            this.view.printAccountHistory(account);
        } else {
            this.view.printAccountNotFound(argument);
        }
    }
}