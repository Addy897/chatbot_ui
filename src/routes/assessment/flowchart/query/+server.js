import { OPENAI_API } from '$env/static/private';


export async function POST({request}) {
    const {prompt} = await request.json(); 

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that generates complete MermaidJs code.' },
                    { role: 'user', content: `Generate MermaidJs code for the following scenario: ${prompt}` }
                ],
                max_tokens: 500,
                n: 1,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        let mermaidCode = data.choices[0].message.content.trim();
        const pattern = /(```mermaid)([\s\S]*?)(```)/;
        const match = mermaidCode.match(pattern);
        if (match) {
            mermaidCode=match[2];
        }
        return new Response(JSON.stringify({ mermaidCode }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ error: 'Error fetching Mermaid code' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
