import { useAuth } from '../contexts/AuthContext';

/**
 * Returns the currently authenticated user for feature components.
 * Protected routes guarantee that a user is available before rendering.
 */
export function useCurrentUser() {
    const { user } = useAuth();
    return user;
}
