/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    let {inputC}=await request.json()
    let input="<s>[INST]"+ inputC+"[/INST]"
    const data={inputs:input}
    let token=import.meta.env.VITE_HF_TOKEN
    const response = await fetch(
		"https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
		{
      
			headers: { Authorization: token,'Content-Type': 'application/json' },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	let result = await response.json(); 
    result=result[0].generated_text.substring(input.length)
    return new Response(result);
}