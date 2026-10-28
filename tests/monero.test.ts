import { describe, it, expect } from "vitest";
import { isValidMoneroAddress } from "../src/escrow/escrow.wallet.service";

describe("isValidMoneroAddress", () => {
    it("rejects non-string", () => {
        expect(isValidMoneroAddress(123 as any)).toBe(false);
    });
    it("rejects short", () => {
        expect(isValidMoneroAddress("5abc")).toBe(false);
    });
});
