<script>
	import { Button, Dropzone, Spinner } from 'flowbite-svelte';
	import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let value = [];
	let f = undefined;
	let pdf_link = null;
	let user = null;
	let img_uuid = null;
	let html_report = null;
	let loading = false;
	onMount(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			user = JSON.parse(storedUser);
			img_uuid = `${user.uid}.pdf`;
		} else {
			if (browser) {
				window.location.href = '/login';
			}
		}
	});
	const dropHandle = (event) => {
		event.preventDefault();
		if (event.dataTransfer.items) {
			const files = event.dataTransfer.items[0];
			if (files.kind === 'file') {
				const file = files.getAsFile();
				var ext = file.name.match('(?<=.)[a-zA-Z0-9]+$').at(0);
				if (ext === 'pdf') {
					value = [file.name];
					value = value;
				} else {
					value = [];
					f = undefined;
				}
			}
		}
	};
	const handleChange = (event) => {
		const files = event.target.files[0];
		var ext = files.name.match('(?<=.)[a-zA-Z0-9]+$').at(0);
		if (ext === 'pdf') {
			value = [files.name];
			value = value;
		} else {
			value = [];
			f = undefined;
		}
	};

	const showFiles = (files) => {
		if (files.length === 1) return files[0];
		let concat = '';
		files.map((file) => {
			concat += file;
			concat += ',';
			concat += ' ';
		});

		if (concat.length > 40) concat = concat.slice(0, 40);
		concat += '...';
		return concat;
	};

	async function handleFileUpload() {
		const file = f[0];
		if (file) {
			const storage = getStorage();
			const storageRef = ref(storage, img_uuid);
			loading = true;
			await uploadBytes(storageRef, file).then(async (snapshot) => {
				await getDownloadURL(snapshot.ref).then((url) => {
					pdf_link = url;
				});
			});
			const data = {
				report_url: pdf_link
			};
			const response = await fetch('/assessment/query', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			html_report = await response.json();
			loading = false;
		}
	}
</script>
<div class="flex flex-col justify-center items-center gap-8 p-12 h-screen">
{#if loading}
	<Spinner />
    <div class="font-mono text-xl text-center">Analyzing Report...</div>
{:else if html_report}
	<iframe class="w-full h-screen" title="analysis" srcdoc={html_report.analysis.replaceAll("```html","").replaceAll("```","")} />
{:else}
	
		<Dropzone
			id="dropzone"
			on:drop={dropHandle}
			on:dragover={(event) => {
				event.preventDefault();
			}}
			bind:files={f}
			on:change={handleChange}
		>
			<svg
				aria-hidden="true"
				class="mb-3 w-10 h-10 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/></svg
			>
			{#if value.length === 0}
				<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
					<span class="font-semibold">Click to upload</span> or drag and drop
				</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Upload Blood Report in pdf Format
				</p>
			{:else}
				<p>{showFiles(value)}</p>
			{/if}
		</Dropzone>

		<Button
			type="submit"
			class="bg-black text-white hover:bg-black w-1/4"
			on:click={() => {
				handleFileUpload();
			}}>Submit</Button
		>
	
{/if}
</div>
