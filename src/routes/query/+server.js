export const config = {
	maxDuration: 60, // 5 seconds
  };
import { AI_API } from '$env/static/private';
/** @type {import('./$types').RequestHandler} */

function build_prompt(messages){
	messages.pop()
	let DEFAULT_IMAGE_TOKEN = "<image>"
	let pr=""
	for(let i=0;i<messages.length;i++){
		if(messages[i].text){
			pr+=`${messages[i].text}\n\n`
		}
	}
	return pr
}
export async function POST({ request }) {
    try {
        const { messages, image_link } = await request.json();
        let pr=build_prompt(messages)
		let images=[]
		if(image_link){
			images=[image_link]
		}
        const data = {
            prompt: pr,
			images:images
        };

        const response = await fetch(AI_API, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const headers = new Headers(response.headers);

        const textStream = new ReadableStream({
            start(controller) {
                const reader = response.body.getReader();

                async function forwardResponse() {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) {
                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                        }
                    } catch (error) {
                        console.error('Error reading response:', error);
                        controller.error(error);
                    }
                }

                forwardResponse();
            }
        });

        return new Response(textStream, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
        });

    } catch (error) {
        console.error('Error occurred:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}