import { describe, it, expect } from "vitest";
import { calcEloChange } from "../src/utils/elo";

describe("calcEloChange", () => {
    it("returns positive", () => {
        expect(calcEloChange(1000, 1000)).toBeGreaterThan(0);
    });
});
