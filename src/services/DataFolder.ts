import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { isSupported } from "../importers/importerFor";

export class DataFolder {
	constructor(readonly path: string = join(process.cwd(), "data")) {}

	resolve(fileName: string): string {
		return join(this.path, fileName);
	}

	listImportable(): string[] {
		if (!existsSync(this.path)) {
			return [];
		}
		return readdirSync(this.path).filter(isSupported).sort();
	}
}
