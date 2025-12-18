const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchCalculation(params) {
    try {
        const response = await fetch(`${API_URL}/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`Calculation failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export async function fetchMetadata() {
    try {
        const response = await fetch(`${API_URL}/metadata`);
        if (!response.ok) {
            throw new Error(`Metadata fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Metadata Error', error);
        return null;
    }
}
