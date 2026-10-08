import { JSON_DATE_FORMAT } from "../utils/dateformat";
import { asText } from "./asText";
import type { FileImporter, RawRecord } from "./FileImporter";

const FIRST_RECORD_NUMBER = 1;

interface JsonRecord {
	Date?: unknown;
	FromAccount?: unknown;
	ToAccount?: unknown;
	Narrative?: unknown;
	Amount?: unknown;
}

export class JsonImporter implements FileImporter {
	readonly dateFormat = JSON_DATE_FORMAT;

	read(content: string): RawRecord[] {
		const data: unknown = JSON.parse(content);
		if (!Array.isArray(data)) {
			throw new Error("expected a JSON array of transactions");
		}

		return data.map((item: unknown, index) => {
			const record = (
				typeof item === "object" && item !== null ? item : {}
			) as JsonRecord;
			return {
				location: `record ${index + FIRST_RECORD_NUMBER}`,
				date: asText(record.Date),
				from: asText(record.FromAccount),
				to: asText(record.ToAccount),
				narrative: asText(record.Narrative),
				amount: asText(record.Amount),
			};
		});
	}
}
