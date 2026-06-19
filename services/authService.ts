export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    picture?: string;
    isVerified?: boolean;
}

export interface LoginResponse {
    user: User;
    message: string;
}

export interface RegisterResponse {
    message: string;
    email: string;
    requiresOtp: boolean;
}

export interface VerifyOtpResponse {
    user: User;
    message: string;
    access_token: string;
}

export const authService = {
    // Login with email and password
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return response.json();
    },

    // Register new user
    register: async (email: string, password: string): Promise<RegisterResponse> => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    },

    // Verify OTP
    verifyOtp: async (email: string, otpCode: string): Promise<VerifyOtpResponse> => {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otpCode }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Verification failed');
        }

        return response.json();
    },

    // Resend OTP
    resendOtp: async (email: string): Promise<{ message: string }> => {
        const response = await fetch('/api/auth/resend-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to resend code');
        }

        return response.json();
    },

    // Logout
    logout: async (): Promise<void> => {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }
    },

    // Login with Google
    loginWithGoogle: async (token: string, redirectTo: string = '/'): Promise<void> => {
        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, redirectTo }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Google login failed');
        }

        const data = await response.json();
        window.location.href = data.redirectTo;
    },

    // Set token (for client-side storage if needed)
    setToken: (token: string): void => {
        localStorage.setItem('auth_token', token);
    },

    // Get token
    getToken: (): string | null => {
        return localStorage.getItem('auth_token');
    },

    // Clear token
    clearToken: (): void => {
        localStorage.removeItem('auth_token');
    },

    // Check if user is authenticated
    isAuthenticated: async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/me');
            return response.ok;
        } catch {
            return false;
        }
    },

    // Get current user
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const response = await fetch('/api/auth/me');
            if (!response.ok) return null;
            const data = await response.json();
            return data.user;
        } catch {
            return null;
        }
    },
};