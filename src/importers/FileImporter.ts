export interface RawRecord {
	location: string;
	date: string;
	from: string;
	to: string;
	narrative: string;
	amount: string;
}

export interface FileImporter {
	readonly dateFormat: string;
	read(content: string): RawRecord[];
}
