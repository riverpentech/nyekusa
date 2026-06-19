export interface LeadershipTerm {
    id: string;
    full_name: string;
    position: string;
    bio?: string;
    term_year: string;
    is_current: boolean;
    photo_url?: string;
    order: number;
    email?: string;
    linkedin_url?: string;
    twitter_url?: string;
}

export const leadershipService = {
    // Get all leadership terms
    list: async (order: string = 'order', limit: number = 50): Promise<LeadershipTerm[]> => {
        const response = await fetch(`/api/leadership?order=${order}&limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch leadership data');
        }
        return response.json();
    },

    // Get a single leadership entry by ID
    get: async (id: string): Promise<LeadershipTerm> => {
        const response = await fetch(`/api/leadership/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch leadership entry');
        }
        return response.json();
    },

    // Create a new leadership entry
    create: async (data: Partial<LeadershipTerm>): Promise<LeadershipTerm> => {
        const response = await fetch('/api/leadership', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create leadership entry');
        }
        return response.json();
    },

    // Update a leadership entry
    update: async (id: string, data: Partial<LeadershipTerm>): Promise<LeadershipTerm> => {
        const response = await fetch(`/api/leadership/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update leadership entry');
        }
        return response.json();
    },

    // Delete a leadership entry
    delete: async (id: string): Promise<void> => {
        const response = await fetch(`/api/leadership/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete leadership entry');
        }
    },
};