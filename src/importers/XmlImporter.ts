import { addDays, format } from "date-fns";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { DATE_FORMAT } from "../utils/dateformat";
import { asText } from "./asText";
import type { FileImporter, RawRecord } from "./FileImporter";

const FIRST_RECORD_NUMBER = 1;
const TRANSACTION_TAG = "SupportTransaction";
const EXCEL_EPOCH = new Date(1899, 11, 30);
const SERIAL_DATE_PATTERN = /^\d+$/;

interface XmlTransaction {
	"@_Date"?: unknown;
	Description?: unknown;
	Value?: unknown;
	Parties?: { From?: unknown; To?: unknown };
}

const parser = new XMLParser({
	ignoreAttributes: false,
	parseTagValue: false,
	isArray: (name) => name === TRANSACTION_TAG,
});

export class XmlImporter implements FileImporter {
	readonly dateFormat = DATE_FORMAT;

	read(content: string): RawRecord[] {
		const validation = XMLValidator.validate(content);
		if (validation !== true) {
			throw new Error(
				`invalid XML at line ${validation.err.line}: ${validation.err.msg}`,
			);
		}

		const document = parser.parse(content) as {
			TransactionList?: { [TRANSACTION_TAG]?: XmlTransaction[] };
		};
		const transactions = document.TransactionList?.[TRANSACTION_TAG] ?? [];

		return transactions.map((item, index) => ({
			location: `record ${index + FIRST_RECORD_NUMBER}`,
			date: fromExcelSerial(asText(item["@_Date"])),
			from: asText(item.Parties?.From),
			to: asText(item.Parties?.To),
			narrative: asText(item.Description),
			amount: asText(item.Value),
		}));
	}
}

function fromExcelSerial(serial: string): string {
	if (!SERIAL_DATE_PATTERN.test(serial)) {
		return serial;
	}
	return format(addDays(EXCEL_EPOCH, Number(serial)), DATE_FORMAT);
}
