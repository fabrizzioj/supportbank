import { getLogger } from "log4js";
import { CommandController } from "./controllers/CommandController";
import { configureLogging } from "./logging";
import { Bank } from "./services/Bank";
import { DataFolder } from "./services/DataFolder";
import { TransactionLoader } from "./services/TransactionLoader";
import { ConsoleView } from "./views/ConsoleView";

// empty list so that the files are added by the user with `list` command
const DEFAULT_FILES: string[] = [];

const logger = getLogger("index");

function main(): void {
	configureLogging();
	logger.info("SupportBank starting");

	const dataFolder = new DataFolder();
	const controller = new CommandController(
		new Bank(),
		new ConsoleView(),
		new TransactionLoader(),
		dataFolder,
	);
	for (const file of DEFAULT_FILES) {
		controller.importFile(dataFolder.resolve(file));
	}

	controller.run();
	logger.info("SupportBank shutting down");
}

main();
