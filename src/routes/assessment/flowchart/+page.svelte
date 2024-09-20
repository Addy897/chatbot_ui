<script>
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';
	let mermaidCode = '';
    let search='';
	let svg = '';
	onMount(async () => {
		mermaid.initialize({ startOnLoad: true });
	});
    async function genDiagram(){
        if(search==="" || search===undefined){
            return
        }
        try {
			const response = await fetch('/assessment/flowchart/query/', {
				method: 'POST',
                body: JSON.stringify({prompt:search})
			});
			const data = await response.json();
			mermaidCode = data.mermaidCode;
			svg = (await mermaid.render('mermaid', mermaidCode)).svg;
		} catch (error) {
			console.error('Error fetching Mermaid code:', error);
		}
    }
</script>

<div class="flex flex-col w-full justify-center items-center gap-10">
	<div class="flex flex-row w-full justify-center gap-5">
		<div class="flex">
			<input
				type="text"
				placeholder=""
				name="keyword"
				bind:value={search}
				class="bg-[#FEFFAC] font-mono text-black border-2 shadow-md rounded-xl px-6 py-1 focus:outline-none text-center w-full"
			/>
		</div>
		<button on:click={genDiagram}>Generate</button>
	</div>

	{@html svg}
</div>
