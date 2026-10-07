import { appendFileSync, mkdirSync } from "fs";
import { dirname } from "path";

export class Logger {
	constructor(private readonly filePath: string) {
		mkdirSync(dirname(filePath), { recursive: true });
	}

	info(message: string): void {
		this.write("INFO", message);
	}

	warn(message: string): void {
		this.write("WARN", message);
	}

	error(message: string): void {
		this.write("ERROR", message);
	}

	private write(level: string, message: string): void {
		appendFileSync(
			this.filePath,
			`${new Date().toISOString()} [${level}] ${message}\n`,
		);
	}
}
