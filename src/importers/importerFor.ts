import { extname } from "path";
import { CsvImporter } from "./CsvImporter";
import type { FileImporter } from "./FileImporter";
import { JsonImporter } from "./JsonImporter";
import { XmlImporter } from "./XmlImporter";

const IMPORTERS: Record<string, FileImporter> = {
	".csv": new CsvImporter(),
	".json": new JsonImporter(),
	".xml": new XmlImporter(),
};

const supportedFormats = Object.keys(IMPORTERS).join(", ");

export function isSupported(filePath: string): boolean {
	return Object.hasOwn(IMPORTERS, extname(filePath).toLowerCase());
}

export function importerFor(filePath: string): FileImporter {
	const extension = extname(filePath).toLowerCase();
	const importer = IMPORTERS[extension];
	if (!importer) {
		throw new Error(
			`unsupported file type "${extension || "(none)"}" (expected ${supportedFormats})`,
		);
	}
	return importer;
}
