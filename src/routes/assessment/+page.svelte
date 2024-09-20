<script>
	import { goto } from '$app/navigation';	
	import { Card} from 'flowbite-svelte';
	import icon from '$lib/images/icon.png';
	import { browser } from '$app/environment';
	let user;
	if(browser){
	const storedUser = localStorage.getItem('user');
		if (storedUser) {
			user = JSON.parse(storedUser);
		} 
	}
	
</script>


	<div class="flex flex-col w-full h-[90vh] justify-center items-center gap-2">
		<img src={icon} alt="" class="w-48" />
		{#if user}
			<div class="text-[#5786B2]">
				Welcome {user.displayName} !
			</div>
		{/if}
		<div class="grid  gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">

		<Card
			class="flex flex-col justify-start bg-[#FEFFED] cursor-pointer border-black w-52"
			on:click={() => {
				goto("/assessment/bloodreport")
			}}
		>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g clip-path="url(#clip0_238_1292)">
					<path
						d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
						fill="#67AD4E"
					/>
					<path d="M14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="#67AD4E" />
				</g>
				<defs>
					<clipPath id="clip0_238_1292">
						<rect width="24" height="24" fill="white" />
					</clipPath>
				</defs>
			</svg>

			<h5 class="mb-2 tracking-tight text-gray-900 dark:text-white font-medium">Blood Report Analysis</h5>
		</Card>
		<Card
		class="flex flex-col justify-start bg-[#FEFFED] cursor-pointer border-black w-52"
		on:click={() => {
			goto("/assessment/flowchart")
		}}
	>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clip-path="url(#clip0_238_1292)">
				<path
					d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
					fill="#67AD4E"
				/>
				<path d="M14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="#67AD4E" />
			</g>
			<defs>
				<clipPath id="clip0_238_1292">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>

		<h5 class="mb-2 tracking-tight text-gray-900 dark:text-white font-medium">Make Flowchart</h5>
	</Card>
	</div>
</div>
