export interface Column<T> {
    header: string;
    value: (item: T) => string;
    align?: "left" | "right";
}

const COLUMN_GAP = "  ";
const SEPARATOR_CHAR = "-";

export function formatTable<T>(columns: Column<T>[], items: readonly T[]): string {
    const cells = items.map((item) => columns.map((c) => c.value(item)));
    const widths = columns.map((c, i) =>
        Math.max(c.header.length, ...cells.map((row) => row[i]?.length ?? 0)),
    );

    const formatRow = (values: string[]): string =>
        values
            .map((text, i) => {
                const width = widths[i] ?? 0;
                return columns[i]?.align === "right" ? text.padStart(width) : text.padEnd(width);
            })
            .join(COLUMN_GAP)
            .trimEnd();

    const totalWidth =
        widths.reduce((sum, w) => sum + w, 0) + COLUMN_GAP.length * (widths.length - 1);

    return [
        formatRow(columns.map((c) => c.header)),
        SEPARATOR_CHAR.repeat(totalWidth),
        ...cells.map(formatRow),
    ].join("\n");
}
