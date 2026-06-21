const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

type OpportunityParams = {
    is_active?: boolean | string;
    limit?: number | string;
    sort?: string;
    [key: string]: string | number | boolean | undefined;
};

export async function getOpportunities(params: OpportunityParams = {}) {
    const { is_active, limit = 50, sort = '-created_date', ...filters } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    if (is_active !== undefined) queryParams.append('is_active', String(is_active));
    if (limit) queryParams.append('limit', String(limit));
    if (sort) queryParams.append('sort', sort);

    // Add any additional filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") queryParams.append(key, String(value));
    });

    const url = `${API_BASE_URL}/api/opportunities?${queryParams.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Using SSR/SSG based on your needs
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export async function getOpportunitiesServerAction(params: OpportunityParams = {}) {
    return getOpportunities(params);
}
