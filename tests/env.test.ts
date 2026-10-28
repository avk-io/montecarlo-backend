import { describe, it, expect } from "vitest";
import { env } from "../src/config/env";

describe("env", () => {
    it("loads", () => {
        expect(env.PORT).toBeGreaterThan(0);
    });
});
