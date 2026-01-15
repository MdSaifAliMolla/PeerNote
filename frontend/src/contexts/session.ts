import React from "react";

interface SessionInfo {
    token: string;
    isAdmin?: boolean;
}

type SessionContextType = SessionInfo | null;

export const getSessionCookie = (): SessionInfo | null => {
    // const sessionCookie = document.cookie
    //     .split('; ')
    //     .find(row => row.startsWith('token='))
    //     ?.split('=')[1];
    if (typeof window === 'undefined') {
        return null;
    }
    const token = localStorage.getItem('authToken');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!token) return null;
    return { token, isAdmin };
}
export const destroySessionCookie = () => {
    if (typeof window === 'undefined') {
        return;
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    // document.cookie = "token=; Max-Age=0;"
}

export const SessionContext = React.createContext<SessionContextType>(null);
