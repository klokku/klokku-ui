export const SESSION_EXPIRED_EVENT = "klokku:session-expired";
export type SessionExpiredEvent = CustomEvent<{profileUid: string}>;
