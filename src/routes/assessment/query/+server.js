export const config = {
	maxDuration: 60,
  };
import { BLOOD_REPORT } from '$env/static/private';

export async function POST({ request }) {
    try {
        const { report_url} = await request.json();
		
        const data = {
            report_url: report_url,
        };

        const response = await fetch(BLOOD_REPORT, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        return response

    } catch (error) {
        console.error('Error occurred:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}