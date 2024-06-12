export const config = {
	maxDuration: 60, // 5 seconds
  };
import { AI_API } from '$env/static/private';
/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    let {inputC,image_link}=await request.json()
    const data={user_input:inputC,image_url:image_link}
	try{
    const response = await fetch(AI_API,
		{
      
			headers: {'Content-Type': 'application/json' },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
}catch{
	return new Response("AI Model is down. Please try again later.")
}
	let result;
	result = await response.json();
    result=result.response
	
	
    return new Response(result);
}