import { Actor } from "./actor";
import { EscrowState } from "./state";

export class InvalidTransitionError extends Error {
    constructor(from: EscrowState, to: EscrowState) {
        super(
            `Invalid transition: ${EscrowState[from]} -> ${EscrowState[to]}`
        );

        this.name = "InvalidTransitionError";
    }
}

export class UnauthorizedActorError extends Error {
    constructor(actor: Actor, state: EscrowState) {
        super(
            `${Actor[actor]} cannot transition order to ${EscrowState[state]}`
        );

        this.name = "UnauthorizedActorError";
    }
}

export class OrderNotFoundError extends Error {
    constructor(id: string) {
        super(`Order '${id}' not found`);

        this.name = "OrderNotFoundError";
    }
}

export class ForbiddenActorError extends Error{
    constructor(userId:string,escrowId: string){
        super(
            `User ${userId} cannot access escrow ${escrowId}: no relationship to this order`
        );
        this.name = "ForbiddenActorError";
    }
}