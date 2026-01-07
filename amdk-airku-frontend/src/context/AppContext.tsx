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
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setToken(session.access_token);
                fetchProfile(session.user.id).then(user => {
                    setCurrentUser(user);
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setToken(session.access_token);
                // Only fetch profile if not already loaded or id changed
                if (!currentUser || currentUser.id !== session.user.id) {
                    const user = await fetchProfile(session.user.id);
                    setCurrentUser(user);
                }
            } else {
                setToken(null);
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
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
            {!isLoading && children}
        </AppContext.Provider>
    );
};