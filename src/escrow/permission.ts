import { EscrowState } from "./state";
import { Actor } from "./actor";

type TransitionKey = `${EscrowState}->${EscrowState}`;

export const permissions: Partial<Record<TransitionKey, Actor[]>> = {

    [`${EscrowState.CREATED}->${EscrowState.WAITING_FOR_PAYMENT}`]:
        [Actor.BUYER],

    [`${EscrowState.WAITING_FOR_PAYMENT}->${EscrowState.FUNDED}`]:
        [Actor.WALLET],

    [`${EscrowState.WAITING_FOR_PAYMENT}->${EscrowState.CANCELLED}`]:
        [Actor.SYSTEM, Actor.BUYER],

    [`${EscrowState.WAITING_FOR_PAYMENT}->${EscrowState.EXPIRED}`]:
        [Actor.SYSTEM],

    [`${EscrowState.FUNDED}->${EscrowState.SHIPPED}`]:
        [Actor.SELLER],

    [`${EscrowState.SHIPPED}->${EscrowState.BUYER_CONFIRMED}`]:
        [Actor.BUYER],

    [`${EscrowState.BUYER_CONFIRMED}->${EscrowState.RELEASED}`]:
        [Actor.SYSTEM],

    [`${EscrowState.BUYER_CONFIRMED}->${EscrowState.DISPUTED}`]:
        [Actor.BUYER, Actor.SELLER],

    [`${EscrowState.DISPUTED}->${EscrowState.REFUNDED}`]:
        [Actor.ADMIN],

    [`${EscrowState.DISPUTED}->${EscrowState.RELEASED}`]:
        [Actor.ADMIN],
};