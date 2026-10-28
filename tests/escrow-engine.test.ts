import { describe, it, expect } from "vitest";
import { EscrowEngine } from "../src/escrow/escrow.engine";
import { EscrowState } from "../src/escrow/state";
import { Actor } from "../src/escrow/actor";

describe("EscrowEngine", () => {
    it("allows valid transition", () => {
        const engine = new EscrowEngine();
        const order: any = {
            state: EscrowState.CREATED,
            history: [],
        };
        const res = engine.transition(order, Actor.BUYER, EscrowState.WAITING_FOR_PAYMENT);
        expect(order.state).toBe(EscrowState.WAITING_FOR_PAYMENT);
        expect(res.event).toBeDefined();
    });

    it("rejects invalid transition", () => {
        const engine = new EscrowEngine();
        const order: any = { state: EscrowState.CREATED, history: [] };
        expect(() => engine.transition(order, Actor.BUYER, EscrowState.FUNDED)).toThrow();
    });

    it("rejects unauthorized actor", () => {
        const engine = new EscrowEngine();
        const order: any = { state: EscrowState.CREATED, history: [] };
        expect(() => engine.transition(order, Actor.SELLER, EscrowState.WAITING_FOR_PAYMENT)).toThrow();
    });
});
