import { describe, expect, it } from "vitest";
import { formatPence, toPence } from "../../src/utils/money";

describe("toPence", () => {
    it("converts pounds to integer pence", () => {
        expect(toPence("7.8")).toBe(780);
        expect(toPence("4.37")).toBe(437);
    });

    it("rounds away floating-point error", () => {
        expect(toPence("0.29")).toBe(29);
    });

    it("throws on non-numeric input", () => {
        expect(() => toPence("abc")).toThrow('Invalid amount: "abc"');
    });

    it("throws on empty or whitespace input", () => {
        expect(() => toPence("")).toThrow('Invalid amount: ""');
        expect(() => toPence("   ")).toThrow('Invalid amount: "   "');
    });

    it("throws on non-finite input", () => {
        expect(() => toPence("Infinity")).toThrow('Invalid amount: "Infinity"');
    });
});

describe("formatPence", () => {
    it("formats positive and negative amounts", () => {
        expect(formatPence(780)).toBe("£7.80");
        expect(formatPence(-437)).toBe("-£4.37");
        expect(formatPence(0)).toBe("£0.00");
    });
});
