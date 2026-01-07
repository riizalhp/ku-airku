import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, User } from '../types';
import { supabase } from '../lib/supabaseClient';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            // If profile not found but auth exists, maybe force logout or handle gracefully
            return null;
        }
        return data as User;
    };

    useEffect(() => {
        let mounted = true;
        console.log("AppContext: Initializing...");

        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log("AppContext: getSession result", { session, error });

                if (session?.user) {
                    setToken(session.access_token);
                    console.log("AppContext: Fetching profile for", session.user.id);
                    const user = await fetchProfile(session.user.id);
                    console.log("AppContext: Profile fetched", user);
                    if (mounted) setCurrentUser(user);
                }
            } catch (err) {
                console.error("AppContext: Session check failed", err);
            } finally {
                console.log("AppContext: Setting isLoading false (session check)");
                if (mounted) setIsLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AppContext: Auth Change:", event);
            if (session?.user) {
                setToken(session.access_token);
                // Reload profile if needed
                // Note: we might be fetching it twice on load (once from getSession, once from INITIAL_SESSION event)
                // This is acceptable for safety but we rely on checkSession for initial load logic mostly.
            } else {
                setToken(null);
                setCurrentUser(null);
            }

            // Note: We don't forcefully set isLoading(false) here repeatedly 
            // because checkSession handles the initial load.
            // But just in case:
            if (event === 'INITIAL_SESSION') {
                // Supabase sometimes fires this after getSession
                console.log("AppContext: INITIAL_SESSION event");
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setIsLoading(false);
            throw error;
        }

        // Profile will be loaded by onAuthStateChange or we can load it here to await
        if (data.session?.user) {
            const user = await fetchProfile(data.session.user.id);
            setCurrentUser(user);
        }
        setIsLoading(false);
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        // State updates handled by onAuthStateChange
    }, []);

    const value: AppContextType = {
        currentUser,
        token,
        isLoading,
        login,
        logout,
    };

    return (
        <AppContext.Provider value={value}>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen bg-brand-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    <span className="ml-4 text-brand-dark font-medium">Memuat Aplikasi...</span>
                </div>
            ) : children}
        </AppContext.Provider>
    );
};