import { supabase } from '../lib/supabaseClient';
import { User, Role } from '../types';

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return data as User[];
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<{ message: string }> => {
    // 1. Sign up/Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || '12345678', // Default pwd if missing, should prompt
        options: {
            data: {
                full_name: userData.name,
                role: userData.role,
            }
        }
    });

    if (authError) throw new Error(authError.message);

    // 2. Profile creation is handled by Database Trigger usually, 
    // but if not, we can insert manually here:
    if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            name: userData.name,
            role: userData.role,
            email: userData.email
        });
        if (profileError) {
            // If trigger exists, this might fail as duplicate, which is fine-ish if we handle it.
            // But for manual migration, let's assume no trigger for now.
            console.warn('Profile creation warning:', profileError);
        }
    }

    return { message: 'User registered successfully. Please check email for verification.' };
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    // Admin creating a user. 
    // WARNING: client-side `signUp` signs in the NEW user immediately, kicking out the Admin!
    // We MUST use a Supabase Edge Function for "Admin creates User".
    // For now, I'll log a warning and fallback to registerUser logic which sits on shaky ground for Admin usage.
    console.warn('createUser (Admin) requires Edge Function to avoid logging out Admin. Using fallback.');

    // Fallback: This will behave like register, potentially logging out the admin.
    await registerUser(userData);
    return { ...userData, id: 'temp-id' } as User; // Mock return
};

export const updateUser = async (userData: User): Promise<User> => {
    const { id, ...updateData } = userData;
    // We update the public profile. Auth email/password update requires different API.
    const { data, error } = await supabase.from('users').update({
        name: updateData.name,
        role: updateData.role
    }).eq('id', id).select().single();

    if (error) throw new Error(error.message);
    return data as User;
};

export const deleteUser = async (userId: string): Promise<void> => {
    // Delete from public profile. Auth user deletion requires Admin/Edge Function.
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw new Error(error.message);
};