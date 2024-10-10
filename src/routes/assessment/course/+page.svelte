<script>
	import { onMount } from 'svelte';
	let topic = '';
	let videos = [];

	async function searchYoutubeVideos() {
		if (!topic) return;

		try {
			const response = await fetch(`/assessment/course/search?query=${encodeURIComponent(topic)}`);
			if (response.ok) {
				videos = (await response.json()).body;
			} else {
				console.error('Error fetching videos:', await response.json());
			}
		} catch (error) {
			console.error('Error fetching YouTube videos:', error);
		}
	}

	function handleSearch() {
		searchYoutubeVideos();
	}
</script>

<div class="flex flex-col w-full h-[90vh] justify-start items-center gap-2">
	<div class="flex flex-row gap-5">
		<input type="text" bind:value={topic} placeholder="Enter medical topic" />
		<button on:click={handleSearch}>Search</button>
	</div>
	<div class="flex flex-col justify-center w-full items-center gap-5">
		{#if videos.length > 0}
			
				{#each videos as { title, url, description, videoId }}
					<div class="flex flex-col justify-center items-center">
						<strong>{title}</strong><a href={url} target="_blank">{url}</a>
						<p>Brief: {description.slice(0, 500)}...</p>
						<iframe
							title=""
							width="560"
							height="315"
							src={`https://www.youtube.com/embed/${videoId}`}
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
                    </div>
				{/each}
			
		{/if}
	</div>
</div>
