import { AI_API } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    let {inputC,image_link}=await request.json()
    const data={user_input:inputC,image_url:image_link}
    const response = await fetch(AI_API,
		{
      
			headers: {'Content-Type': 'application/json' },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	try{
	let result = await response.json(); 
    result=result.response
	}catch{
		let result="Error Please Upload Image to ask question."
	}
    return new Response(result);
}