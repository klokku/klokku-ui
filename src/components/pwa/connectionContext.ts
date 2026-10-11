import {createContext, useContext} from "react";

export const ConnectionBlockedContext = createContext(false);

export function useConnectionBlocked() {
    return useContext(ConnectionBlockedContext);
}
