import { EscrowState } from "./state";
import { transistions } from "./transition";
import { EscrowOrder, TransitionResult } from "./types";
import { Actor } from "./actor";
import { permissions } from "./permission";
import { EscrowEvent, eventMap } from "./event";
import {
    InvalidTransitionError,
    UnauthorizedActorError,
} from "./errors";

export class EscrowEngine {

    private remember(
        order: EscrowOrder,
        from: EscrowState,
        to: EscrowState,
        actor: Actor
    ) {
        order.history.push({
            from,
            to,
            actor,
            timestamp: new Date(),
        });
    }

    transition(
        order: EscrowOrder,
        actor: Actor,
        next: EscrowState
    ): TransitionResult {

        const allowedTransitions = transistions[order.state];

        if (!allowedTransitions.includes(next)) {
            throw new InvalidTransitionError(
                order.state,
                next
            );
        }

        const from = order.state;

        const transitionKey = `${from}->${next}` as keyof typeof permissions;

        const allowedActors = permissions[transitionKey];

        if (!allowedActors || !allowedActors.includes(actor)) {
            throw new UnauthorizedActorError(
                actor,
                next
            );
        }

        const eventKey = transitionKey as keyof typeof eventMap;
        const event = eventMap[eventKey];

        if (!event) {
            throw new Error("Missing escrow event mapping");
        }

        this.remember(order, from, next, actor);

        order.state = next;

        return {
            order,
            event,
        };
    }

}