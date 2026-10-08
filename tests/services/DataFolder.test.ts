import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DataFolder } from "../../src/services/DataFolder";

describe("DataFolder", () => {
	let dir: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "supportbank-"));
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("lists only supported files, sorted", () => {
		for (const name of ["b.json", "a.csv", "notes.txt", "c.XML"]) {
			writeFileSync(join(dir, name), "");
		}

		expect(new DataFolder(dir).listImportable()).toEqual([
			"a.csv",
			"b.json",
			"c.XML",
		]);
	});

	it("returns an empty list when the folder does not exist", () => {
		expect(new DataFolder(join(dir, "missing")).listImportable()).toEqual([]);
	});

	it("resolves file names inside the folder", () => {
		expect(new DataFolder(dir).resolve("a.csv")).toBe(join(dir, "a.csv"));
	});
});
