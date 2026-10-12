import { join } from "path";
import { keyInSelect } from "readline-sync";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandController } from "../../src/controllers/CommandController";
import { Bank } from "../../src/services/Bank";
import { DataFolder } from "../../src/services/DataFolder";
import type { TransactionLoader } from "../../src/services/TransactionLoader";
import { makeFakeView, makeTransaction } from "../helpers/factories";

vi.mock("readline-sync", () => ({
	question: vi.fn(),
	keyInYNStrict: vi.fn(),
	keyInSelect: vi.fn(),
}));

describe("CommandController.handle", () => {
	let bank: Bank;
	let fake: ReturnType<typeof makeFakeView>["fake"];
	let controller: CommandController;
	let loader: { load: ReturnType<typeof vi.fn> };
	let dataFolder: DataFolder;

	beforeEach(() => {
		vi.mocked(keyInSelect).mockReset();
		bank = new Bank();
		bank.apply(makeTransaction({ from: "Jon A", to: "Sarah T" }));
		const fakes = makeFakeView();
		fake = fakes.fake;
		loader = { load: vi.fn() };
		dataFolder = new DataFolder();
		controller = new CommandController(
			bank,
			fakes.view,
			loader as unknown as TransactionLoader,
			dataFolder,
		);
	});

	it("List All prints all accounts", () => {
		expect(controller.handle("List All")).toBe(true);
		expect(fake.printAllAccounts).toHaveBeenCalledWith(bank.getAllAccounts());
	});

	it("List <Name> prints that account's history (case-insensitive)", () => {
		controller.handle("list jon a");
		expect(fake.printAccountHistory).toHaveBeenCalledWith(
			bank.getAccount("Jon A"),
		);
	});

	it("List <Unknown> reports not found", () => {
		controller.handle("List Nobody");
		expect(fake.printAccountNotFound).toHaveBeenCalledWith("Nobody");
	});

	it("handles extra whitespace in names", () => {
		controller.handle("List   Jon   A");
		expect(fake.printAccountHistory).toHaveBeenCalledWith(
			bank.getAccount("Jon A"),
		);
	});

	it("unknown commands are reported", () => {
		controller.handle("Foo");
		expect(fake.printUnknownCommand).toHaveBeenCalledWith("Foo");
	});

	it("Exit stops the loop", () => {
		expect(controller.handle("Exit")).toBe(false);
	});

	it("Import File loads the file and adds its transactions", () => {
		loader.load.mockReturnValue({
			transactions: [
				makeTransaction({ from: "Todd", to: "Rob S", amountPence: 819 }),
			],
			skipped: [],
		});

		controller.handle("Import File Transactions2013.json");

		expect(loader.load).toHaveBeenCalledWith(
			expect.stringContaining(join("data", "Transactions2013.json")),
		);
		expect(bank.getAccount("Todd")?.balance).toBe(-819);
		expect(fake.printImported).toHaveBeenCalledWith("Transactions2013.json", 1);
	});

	it("Import File reports files that cannot be loaded", () => {
		loader.load.mockImplementation(() => {
			throw new Error(
				'unsupported file type ".txt" (expected .csv, .json, .xml)',
			);
		});

		controller.handle("Import File foo.txt");

		expect(fake.printFileError).toHaveBeenCalledWith(
			"foo.txt",
			'unsupported file type ".txt" (expected .csv, .json, .xml)',
		);
	});

	it("Import without File shows help", () => {
		controller.handle("Import");
		expect(fake.printHelp).toHaveBeenCalled();
	});

	it("Import File refuses a file that was already imported", () => {
		loader.load.mockReturnValue({
			transactions: [makeTransaction()],
			skipped: [],
		});

		controller.handle("Import File Transactions2013.json");
		controller.handle("Import File transactions2013.JSON");

		expect(loader.load).toHaveBeenCalledTimes(1);
		expect(fake.printAlreadyImported).toHaveBeenCalledWith(
			"transactions2013.JSON",
		);
	});

	it("Import File allows a retry after a failed import", () => {
		loader.load.mockImplementationOnce(() => {
			throw new Error("boom");
		});
		loader.load.mockReturnValueOnce({ transactions: [], skipped: [] });

		controller.handle("Import File Transactions2013.json");
		controller.handle("Import File Transactions2013.json");

		expect(loader.load).toHaveBeenCalledTimes(2);
		expect(fake.printAlreadyImported).not.toHaveBeenCalled();
	});

	it("Import File with no name imports the file picked from the list", () => {
		vi.spyOn(dataFolder, "listImportable").mockReturnValue([
			"Transactions2012.xml",
			"Transactions2013.json",
		]);
		vi.mocked(keyInSelect).mockReturnValue(1);
		loader.load.mockReturnValue({ transactions: [], skipped: [] });

		controller.handle("Import File");

		expect(keyInSelect).toHaveBeenCalledWith(
			["Transactions2012.xml", "Transactions2013.json"],
			expect.any(String),
			expect.objectContaining({ guide: false }),
		);
		expect(loader.load).toHaveBeenCalledWith(
			dataFolder.resolve("Transactions2013.json"),
		);
	});

	it("the picker marks files that were already imported", () => {
		vi.spyOn(dataFolder, "listImportable").mockReturnValue([
			"Transactions2012.xml",
			"Transactions2013.json",
		]);
		loader.load.mockReturnValue({ transactions: [], skipped: [] });
		controller.handle("Import File Transactions2012.xml");
		vi.mocked(keyInSelect).mockReturnValue(-1);

		controller.handle("Import File");

		expect(keyInSelect).toHaveBeenCalledWith(
			["Transactions2012.xml (imported)", "Transactions2013.json"],
			expect.any(String),
			expect.anything(),
		);
		expect(loader.load).toHaveBeenCalledTimes(1);
	});

	it("the picker reports an empty data folder", () => {
		vi.spyOn(dataFolder, "listImportable").mockReturnValue([]);

		controller.handle("Import File");

		expect(keyInSelect).not.toHaveBeenCalled();
		expect(fake.printNoImportableFiles).toHaveBeenCalledWith(dataFolder.path);
	});
});
