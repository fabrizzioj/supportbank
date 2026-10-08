export function asText(value: unknown): string {
	return typeof value === "string" || typeof value === "number"
		? String(value)
		: "";
}
