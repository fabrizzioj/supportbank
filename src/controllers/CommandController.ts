import { getLogger } from "log4js";
import { question } from "readline-sync";
import type { Bank } from "../services/Bank";
import type { ConsoleView } from "../views/ConsoleView";

const logger = getLogger("CommandController");

export class CommandController {
	constructor(
		private readonly bank: Bank,
		private readonly view: ConsoleView,
	) {}

    run(): void {
        logger.info("Starting command loop");
        this.view.printHelp();
        let running = true;
        while (running) {
            const input = question("> ").trim();
            logger.debug(`User entered "${input}"`);
            try {
                running = this.handle(input);
            } catch (error) {
                logger.error(`Command "${input}" failed`, error);
                this.view.printError("Something went wrong running that command. Details have been logged.");
            }
        }
        logger.info("User exited");
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
                logger.warn(`Unknown command "${input}"`);
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
            logger.info(`No account found for "${argument}"`);
            this.view.printAccountNotFound(argument);
        }
    }
}
