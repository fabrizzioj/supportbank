import { getLogger } from "log4js";
import { basename, resolve } from "path";
import { keyInSelect, keyInYNStrict, question } from "readline-sync";
import type { Bank } from "../services/Bank";
import type { DataFolder } from "../services/DataFolder";
import type { TransactionLoader } from "../services/TransactionLoader";
import type { ParseResult } from "../services/TransactionParser";
import type { ConsoleView } from "../views/ConsoleView";

const logger = getLogger("CommandController");

export class CommandController {
	private readonly importedFiles = new Set<string>();

	constructor(
		private readonly bank: Bank,
		private readonly view: ConsoleView,
		private readonly loader: TransactionLoader,
		private readonly dataFolder: DataFolder,
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
				this.view.printError(
					"Something went wrong running that command. Details have been logged.",
				);
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
			case "import":
				this.import(argument);
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

	importFile(filePath: string): void {
		const fileName = basename(filePath);
		if (this.isImported(filePath)) {
			logger.info(`Refused to import ${filePath} again`);
			this.view.printAlreadyImported(fileName);
			return;
		}

		let result: ParseResult;
		try {
			result = this.loader.load(filePath);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			logger.error(`Could not load ${filePath}`, error);
			this.view.printFileError(fileName, message);
			return;
		}

		if (result.skipped.length > 0) {
			this.view.printSkippedRows(result.skipped);
			const proceed = keyInYNStrict(
				`Import the ${result.transactions.length} valid transactions from ${fileName} anyway?`,
			);
			logger.info(
				`User ${proceed ? "accepted" : "declined"} partial import of ${fileName}`,
			);
			if (!proceed) {
				this.view.printImportCancelled(fileName);
				return;
			}
		}

		this.bank.applyAll(result.transactions);
		this.importedFiles.add(importKey(filePath));
		logger.info(
			`Imported ${result.transactions.length} transactions from ${fileName}`,
		);
		this.view.printImported(fileName, result.transactions.length);
	}

	private import(argument: string): void {
		const [kind = "", ...nameParts] = argument.split(" ");
		if (kind.toLowerCase() !== "file") {
			this.view.printHelp();
			return;
		}
		const fileName = nameParts.join(" ") || this.chooseFile();
		if (fileName) {
			this.importFile(this.dataFolder.resolve(fileName));
		}
	}

	private chooseFile(): string | undefined {
		const files = this.dataFolder.listImportable();
		if (files.length === 0) {
			this.view.printNoImportableFiles(this.dataFolder.path);
			return undefined;
		}

		const labels = files.map((file) =>
			this.isImported(this.dataFolder.resolve(file))
				? `${file} (imported)`
				: file,
		);
		const index = keyInSelect(labels, "Choose a file to import:", {
			guide: false,
			cancel: "Cancel",
		});
		if (index === -1) {
			logger.info("User cancelled file selection");
			return undefined;
		}
		return files[index];
	}

	private isImported(filePath: string): boolean {
		return this.importedFiles.has(importKey(filePath));
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

function importKey(filePath: string): string {
	return resolve(filePath).toLowerCase();
}
