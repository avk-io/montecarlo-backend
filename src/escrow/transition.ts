import { EscrowState } from "./state";

export const transistions: Record<EscrowState, EscrowState[]> = {
    [EscrowState.CREATED]: [
        EscrowState.WAITING_FOR_PAYMENT,
    ],

    [EscrowState.WAITING_FOR_PAYMENT]: [
        EscrowState.FUNDED,
        EscrowState.CANCELLED,
        EscrowState.EXPIRED,
    ],

    [EscrowState.FUNDED]: [
        EscrowState.SHIPPED,
    ],

    [EscrowState.SHIPPED]: [
        EscrowState.BUYER_CONFIRMED,
    ],

    [EscrowState.BUYER_CONFIRMED]: [
        EscrowState.RELEASED,
        EscrowState.DISPUTED,
    ],

    [EscrowState.DISPUTED]: [
        EscrowState.REFUNDED,
        EscrowState.RELEASED,
    ],

    [EscrowState.RELEASED]: [],

    [EscrowState.CANCELLED]: [],

    [EscrowState.EXPIRED]: [],

    [EscrowState.REFUNDED]: [],
};