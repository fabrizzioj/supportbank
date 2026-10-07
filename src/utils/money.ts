const AMOUNT_PATTERN = /^-?\d+(\.\d{1,2})?$/;

export function toPence(amount: string): number {
	if (!AMOUNT_PATTERN.test(amount)) {
		throw new Error(`Invalid amount: "${amount}"`);
	}
	return Math.round(Number(amount) * 100);
}

export function formatPence(pence: number): string {
	const sign = pence < 0 ? "-" : "";
	return `${sign}£${(Math.abs(pence) / 100).toFixed(2)}`;
}
