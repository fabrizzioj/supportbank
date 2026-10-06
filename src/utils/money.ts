export function toPence(amount: string): number {
	const value = Number(amount);
	if (Number.isNaN(value)) {
		throw new Error(`Invalid amount: "${amount}"`);
	}
	return Math.round(value * 100);
}

export function formatPence(pence: number): string {
	const sign = pence < 0 ? "-" : "";
	return `${sign}£${(Math.abs(pence) / 100).toFixed(2)}`;
}
