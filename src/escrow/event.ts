import { EscrowState } from "./state";

export enum EscrowEvent {
    PAYMENT_PENDING = "PAYMENT_PENDING",
    ORDER_FUNDED = "ORDER_FUNDED",
    ORDER_SHIPPED = "ORDER_SHIPPED",
    BUYER_CONFIRMED = "BUYER_CONFIRMED",
    PAYMENT_RELEASED = "PAYMENT_RELEASED",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    ORDER_EXPIRED = "ORDER_EXPIRED",
    DISPUTE_RAISED = "DISPUTE_RAISED",
    DISPUTE_REFUNDED = "DISPUTE_REFUNDED",
    DISPUTE_RELEASED = "DISPUTE_RELEASED",
    PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
}

type TransitionKey = `${EscrowState}->${EscrowState}`;

export const eventMap: Partial<Record<TransitionKey, EscrowEvent>> = {

    [`${EscrowState.CREATED}->${EscrowState.WAITING_FOR_PAYMENT}`]:
        EscrowEvent.PAYMENT_PENDING,

    [`${EscrowState.WAITING_FOR_PAYMENT}->${EscrowState.FUNDED}`]:
        EscrowEvent.ORDER_FUNDED,

    [`${EscrowState.WAITING_FOR_PAYMENT}->${EscrowState.CANCELLED}`]:
        EscrowEvent.ORDER_CANCELLED,

    [`${EscrowState.WAITING_FOR_PAYMENT}->${EscrowState.EXPIRED}`]:
        EscrowEvent.ORDER_EXPIRED,

    [`${EscrowState.FUNDED}->${EscrowState.SHIPPED}`]:
        EscrowEvent.ORDER_SHIPPED,

    [`${EscrowState.SHIPPED}->${EscrowState.BUYER_CONFIRMED}`]:
        EscrowEvent.BUYER_CONFIRMED,

    [`${EscrowState.BUYER_CONFIRMED}->${EscrowState.RELEASED}`]:
        EscrowEvent.PAYMENT_RELEASED,

    [`${EscrowState.BUYER_CONFIRMED}->${EscrowState.DISPUTED}`]:
        EscrowEvent.DISPUTE_RAISED,

    [`${EscrowState.DISPUTED}->${EscrowState.REFUNDED}`]:
        EscrowEvent.DISPUTE_REFUNDED,

    [`${EscrowState.DISPUTED}->${EscrowState.RELEASED}`]:
        EscrowEvent.DISPUTE_RELEASED,

    [`${EscrowState.WAITING_FOR_PAYMENT}->${EscrowState.REFUNDED}`]:
        EscrowEvent.PAYMENT_REFUNDED,
};