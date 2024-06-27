<script>
	import { getAuth } from 'firebase/auth';
	import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config'; 
	import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';

	import { loginStore,allChats ,selectedChats} from '../stores/loginstore';

	import {Dropdown, DropdownDivider, DropdownItem, Drawer,CloseButton,Sidebar,SidebarGroup,SidebarItem,SidebarWrapper} from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { onMount } from 'svelte';
	import icon from '$lib/images/icon.png';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let previousChats = {};
	let messages = [];
	let selectedChat=null
	let page=0;
	let fApp=null
	let user=null
	let hidden2 = true;
	let darkMode = false;


	let spanClass = 'flex-1 ms-3 whitespace-nowrap';
	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};
	allChats.subscribe((m)=>{
    	previousChats=m
	})
	function makeid(length) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
	}
	onMount(() => {
		if (!getApps().length) {
			fApp = initializeApp(firebaseConfig, {
				experimentalForceLongPolling: true,
				useFetchStreams: false
			});
		}else{
            fApp=getApps()[0]
        }
        
		getAuth().onAuthStateChanged(async (currentUser) => {
			user = currentUser;
			if (user) {
				localStorage.setItem('user', JSON.stringify(user));
				const db = getFirestore(fApp);
				const docRef = doc(db, 'chats', user.uid);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					previousChats = docSnap.data().allChats||{};
				}
				loginStore.set({userName:user.displayName,photoURL:user.photoURL})

			} 
		});
	

		
	});

	function toggleSidebar() {
			hidden2 = !hidden2;
	}
	function createNewChat() {
		toggleSidebar()
		page=0
			selectedChat = null;
			messages = [];
			selectedChats.update((m)=>{return messages})
			
	}
	function saveChat() {
			if (messages.length > 0) {
				let title = messages[0].text;
				let i = 0;
				while (!title && i < messages.length) {
					i += 1;
					title = messages[i].text;
				}
				previousChats[title] = { messages: messages };
			}
			fApp = initializeApp(firebaseConfig, {
				experimentalForceLongPolling: true, // this line
				useFetchStreams: false
			});
			const db = getFirestore(fApp);

			setDoc(doc(db, 'chats', user.uid), { allChats: previousChats });
	}
	function selectChat(chat) {
			selectedChat = chat;
			messages = chat.messages;
			selectedChats.update((chats)=>{
				return messages
			})
	}
	function removeChat(chatId) {
			delete previousChats[chatId];
			previousChats = previousChats;
			saveChat();
	}
	async function signOut(){
		try {
			await getAuth().signOut();
			user = null;
			localStorage.removeItem('user');
			loginStore.set({userName:null,pf_photo:null})
		} catch (error) {
			console.error(error.message);
		}
	}

</script>

<Drawer
		transitionType="fly"
		{transitionParams}
		bind:hidden={hidden2}
		id="sidebar2"
		class=" bg-[#CDE6EA]"
	>
		<div class="flex flex-col items-start justify-between gap-5">
			<div class="flex justify-between w-full items-center">
				<h5
					id="drawer-navigation-label-3"
					class="text-black text-xl dark:text-gray-400 font-bold ml-2"
				>
					AI Learning engine
				</h5>
				<CloseButton
					on:click={() => {
						hidden2 = true;
					}}
				/>
			</div>
			<div class="flex flex-col gap-2">
				<span class="text-xs ml-2 -mt-3 -mb-1 text-gray-500 font-medium font-sans">Powered by:</span>
				<div class="ml-2 scale-110 mb-2 mt-1">
					<img src={icon} alt="" class="h-8" />
				</div>
			</div>
		</div>
		<div class="w-64 ml-2 border-[1px] border-[#93B6CF]"></div>
		<Sidebar>
			<SidebarWrapper
				divClass="relative overflow-y-auto py-4 px-3 rounded dark:bg-gray-800 flex flex-col w-full"
			>
				<SidebarGroup>
					<div class="flex flex-row justify-between w-full">
						<button class="ml-1 -mt-1" on:click={() => (hidden2 = true)}>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M13.5 18H4M20 12H4M20 6H4"
									stroke="#004E86"
									stroke-width="2"
									stroke-linecap="round"
								/>
							</svg>
						</button>
						<button class="-mr-3 -mt-1" on:click={createNewChat}>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M7.79001 15.2699L8.52001 11.8599C8.62629 11.3861 8.86568 10.9524 9.21001 10.6099L15.88 3.99993C16.5564 3.3109 17.4748 2.91271 18.44 2.88993C19.168 2.8795 19.87 3.1603 20.39 3.66993C21.5262 5.01239 21.3795 7.01715 20.06 8.17993L13.39 14.8499C13.0476 15.1943 12.6139 15.4337 12.14 15.5399L8.73001 16.2699H8.54001C8.29072 16.2795 8.05262 16.1661 7.90294 15.9665C7.75325 15.7669 7.71105 15.5066 7.79001 15.2699ZM10.27 11.6799C10.1299 11.8157 10.0326 11.9895 9.99001 12.1799L9.50001 14.5099L11.83 14.0099C12.0204 13.9674 12.1942 13.87 12.33 13.7299L19 7.05993C19.7307 6.47495 19.8757 5.42041 19.33 4.65993C19.0911 4.43164 18.7703 4.3091 18.44 4.31993C17.8706 4.34279 17.3325 4.58673 16.94 4.99993L10.27 11.6799Z"
									fill="#004E86"
								/>
								<path
									d="M19.91 10.9299C19.4981 10.9353 19.1654 11.268 19.16 11.6799V17.3699C19.1734 18.1742 18.8633 18.9502 18.2992 19.5236C17.7351 20.0971 16.9644 20.42 16.16 20.4199H6.63002C4.96739 20.3873 3.63513 19.0329 3.63002 17.3699V7.87993C3.65731 6.21502 5.01488 4.87971 6.68002 4.87993H12.37C12.7842 4.87993 13.12 4.54414 13.12 4.12993C13.12 3.71572 12.7842 3.37993 12.37 3.37993H6.63002C4.13652 3.37978 2.10742 5.38658 2.08002 7.87993V17.3699C2.08002 19.8828 4.11712 21.9199 6.63002 21.9199H16.12C18.629 21.9144 20.66 19.8789 20.66 17.3699V11.6799C20.6546 11.268 20.322 10.9353 19.91 10.9299Z"
									fill="#004E86"
								/>
							</svg>
						</button>
					</div>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarItem
						class="ml-0 font-medium mt-4 w-60 h-8"
						label="Ask"
						on:click={()=>{toggleSidebar();goto("/");}}
						href="/"
					>
						<svelte:fragment slot="icon">
							<svg
								width="18"
								height="18"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M4.29482 1.3335H11.7082C13.3969 1.39146 14.7206 2.80456 14.6682 4.4935V8.84016C14.6933 9.65584 14.3922 10.4479 13.8317 11.041C13.2711 11.6341 12.4973 11.9793 11.6815 12.0002H5.33482C4.89561 12.0092 4.4791 12.197 4.18148 12.5202L2.60148 14.2068C2.46762 14.3528 2.27953 14.4372 2.08148 14.4402C1.87694 14.435 1.68296 14.3482 1.54273 14.1992C1.40249 14.0502 1.32763 13.8513 1.33482 13.6468V4.4935C1.2824 2.80456 2.60607 1.39146 4.29482 1.3335ZM11.7081 11.0002C12.8448 10.9427 13.721 9.97702 13.6681 8.84016V4.4935C13.721 3.35664 12.8448 2.39101 11.7081 2.3335H4.29482C3.15819 2.39101 2.28196 3.35664 2.33482 4.4935V13.0268L3.42148 11.8402C3.91843 11.3115 4.60932 11.0082 5.33482 11.0002H11.7081Z"
									fill="black"
								/>
								<path
									d="M5.50148 5.8335H8.83482C9.11096 5.8335 9.33482 5.60964 9.33482 5.3335C9.33482 5.05735 9.11096 4.8335 8.83482 4.8335H5.50148C5.22534 4.8335 5.00148 5.05735 5.00148 5.3335C5.00148 5.60964 5.22534 5.8335 5.50148 5.8335Z"
									fill="black"
								/>
								<path
									d="M10.5015 7.50016H5.50148C5.22534 7.50016 5.00148 7.72402 5.00148 8.00016C5.00148 8.27631 5.22534 8.50016 5.50148 8.50016H10.5015C10.7776 8.50016 11.0015 8.27631 11.0015 8.00016C11.0015 7.72402 10.7776 7.50016 10.5015 7.50016Z"
									fill="black"
								/>
							</svg>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem class="ml-0 font-medium w-60 h-8" label="Notes" {spanClass} on:click={()=>{window.location.href="/notes";toggleSidebar()}}>
						<svelte:fragment slot="icon">
							<svg
								width="16"
								height="12"
								viewBox="0 0 16 12"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M14.5455 0.352941C13.7382 0.105882 12.8509 0 12 0C10.5818 0 9.05455 0.282353 8 1.05882C6.94545 0.282353 5.41818 0 4 0C2.58182 0 1.05455 0.282353 0 1.05882V11.4C0 11.5765 0.181818 11.7529 0.363636 11.7529C0.436364 11.7529 0.472727 11.7176 0.545455 11.7176C1.52727 11.2588 2.94545 10.9412 4 10.9412C5.41818 10.9412 6.94545 11.2235 8 12C8.98182 11.4 10.7636 10.9412 12 10.9412C13.2 10.9412 14.4364 11.1529 15.4545 11.6824C15.5273 11.7176 15.5636 11.7176 15.6364 11.7176C15.8182 11.7176 16 11.5412 16 11.3647V1.05882C15.5636 0.741176 15.0909 0.529412 14.5455 0.352941ZM14.5455 9.88235C13.7455 9.63529 12.8727 9.52941 12 9.52941C10.7636 9.52941 8.98182 9.98824 8 10.5882V2.47059C8.98182 1.87059 10.7636 1.41176 12 1.41176C12.8727 1.41176 13.7455 1.51765 14.5455 1.76471V9.88235Z"
									fill="black"
								/>
								<path
									d="M12 4.23509C12.64 4.23509 13.2582 4.29862 13.8182 4.41862V3.34568C13.2437 3.2398 12.6255 3.17627 12 3.17627C10.7637 3.17627 9.64366 3.38098 8.72729 3.76215V4.93392C9.54911 4.48215 10.6909 4.23509 12 4.23509Z"
									fill="black"
								/>
								<path
									d="M8.72729 5.63959V6.81136C9.54911 6.35959 10.6909 6.11253 12 6.11253C12.64 6.11253 13.2582 6.17606 13.8182 6.29606V5.22312C13.2437 5.11724 12.6255 5.05371 12 5.05371C10.7637 5.05371 9.64366 5.26548 8.72729 5.63959Z"
									fill="black"
								/>
								<path
									d="M12 6.93848C10.7637 6.93848 9.64366 7.14318 8.72729 7.52436V8.69612C9.54911 8.24436 10.6909 7.9973 12 7.9973C12.64 7.9973 13.2582 8.06083 13.8182 8.18083V7.10789C13.2437 6.99495 12.6255 6.93848 12 6.93848Z"
									fill="black"
								/>
							</svg>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem class="ml-0 font-medium w-60 h-8" label="Learn" {spanClass}  on:click={()=>{window.location.href="/learn";toggleSidebar()}}>
						<svelte:fragment slot="icon">
							<svg
								width="12"
								height="15"
								viewBox="0 0 12 15"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M3.32669 5.3535H7.79335C8.04198 5.32445 8.22944 5.11381 8.22944 4.8635C8.22944 4.61318 8.04198 4.40255 7.79335 4.3735H3.32669C3.13798 4.35145 2.95338 4.43972 2.85208 4.60045C2.75078 4.76119 2.75078 4.96581 2.85208 5.12654C2.95338 5.28727 3.13798 5.37554 3.32669 5.3535Z"
									fill="black"
								/>
								<path
									d="M3.32669 10.6868H6.51335C6.70206 10.7089 6.88666 10.6206 6.98796 10.4599C7.08927 10.2991 7.08927 10.0945 6.98796 9.93379C6.88666 9.77306 6.70206 9.68478 6.51335 9.70683H3.32669C3.13798 9.68478 2.95338 9.77306 2.85208 9.93379C2.75078 10.0945 2.75078 10.2991 2.85208 10.4599C2.95338 10.6206 3.13798 10.7089 3.32669 10.6868Z"
									fill="black"
								/>
								<path
									d="M9.06669 8.02016H3.32669C3.13798 8.04221 2.95338 7.95394 2.85208 7.7932C2.75078 7.63247 2.75078 7.42785 2.85208 7.26712C2.95338 7.10639 3.13798 7.01811 3.32669 7.04016H9.06669C9.31531 7.06921 9.50277 7.27985 9.50277 7.53016C9.50277 7.78048 9.31531 7.99111 9.06669 8.02016Z"
									fill="black"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M8.52669 14.0602H3.86002C2.09531 14.0565 0.666683 12.6249 0.666687 10.8602V3.52683C0.670354 1.76472 2.09791 0.337163 3.86002 0.333496H8.52669C10.2914 0.333492 11.723 1.76212 11.7267 3.52683V10.8602C11.7267 11.7089 11.3895 12.5228 10.7894 13.1229C10.1893 13.723 9.37538 14.0602 8.52669 14.0602ZM3.86002 1.3935C2.68333 1.39716 1.73035 2.35014 1.72669 3.52683V10.8602C1.72668 12.0395 2.68073 12.9965 3.86002 13.0002H8.52668C9.70857 13.0002 10.6667 12.0421 10.6667 10.8602V3.52683C10.663 2.34754 9.70597 1.39349 8.52668 1.3935H3.86002Z"
									fill="black"
								/>
							</svg>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem class="ml-0 mb-4 font-medium w-60 h-8" label="Assessment"  on:click={()=>{window.location.href="/assessment";toggleSidebar()}}>
						<svelte:fragment slot="icon">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g clip-path="url(#clip0_191_2001)">
									<path
										d="M8.00002 5.33317C8.7364 5.33317 9.33335 4.73622 9.33335 3.99984C9.33335 3.26346 8.7364 2.6665 8.00002 2.6665C7.26364 2.6665 6.66669 3.26346 6.66669 3.99984C6.66669 4.73622 7.26364 5.33317 8.00002 5.33317Z"
										fill="#05080A"
									/>
									<path
										d="M14 10.6667V9.33333C12.5067 9.33333 11.2267 8.69333 10.2667 7.54667L9.37333 6.48C9.12 6.17333 8.74667 6 8.35333 6H7.65333C7.26 6 6.88667 6.17333 6.63333 6.48L5.74 7.54667C4.77333 8.69333 3.49333 9.33333 2 9.33333V10.6667C3.84667 10.6667 5.46 9.88667 6.66667 8.5V10L4.08 11.0333C3.63333 11.2133 3.33333 11.6533 3.33333 12.14C3.33333 12.8 3.86667 13.3333 4.52667 13.3333H6V13C6 12.08 6.74667 11.3333 7.66667 11.3333H9.66667C9.85333 11.3333 10 11.48 10 11.6667C10 11.8533 9.85333 12 9.66667 12H7.66667C7.11333 12 6.66667 12.4467 6.66667 13V13.3333H11.4733C12.1333 13.3333 12.6667 12.8 12.6667 12.14C12.6667 11.6533 12.3667 11.2133 11.92 11.0333L9.33333 10V8.5C10.54 9.88667 12.1533 10.6667 14 10.6667Z"
										fill="#05080A"
									/>
								</g>
								<defs>
									<clipPath id="clip0_191_2001">
										<rect width="16" height="16" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</SidebarWrapper>
			<div class="w-64 ml-2 border-[1px] border-[#93B6CF] mb-2 -mt-3"></div>
			<p class="font-semibold ml-4 text-md text-slate-700 mb-1">History</p>
			<SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800 flex flex-col gap-1 w-full">
       
				{#each Object.entries(previousChats) as [chat, val]}
        <SidebarGroup>
						<div
             
							class="{darkMode ? 'bg-white text-black' : 'bg-white text-black'} {darkMode
								? ' shadow-gray-500/10 hover:shadow-gray-100/20'
								: 'shadow-gray-900/10 hover:shadow-gray-900/20'} w-60 rounded-lg py-3 px-6 text-start align-middle font-sans text-sm font-semibold shadow-md transition-all hover:shadow-md focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none truncate flex items-center justify-between gap-1 h-8"
							><button class="inline-block w-full truncate" on:click={() => {selectChat(val);toggleSidebar();goto("/")}}
								>{chat}...</button
							><button
								class="{darkMode ? 'text-red-900' : 'text-black'} z-20 -mr-4"
								on:click={() => removeChat(chat)}
								><svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
									/>
								</svg>
							</button></div
						>
        </SidebarGroup>
				{/each}
      
			</SidebarWrapper>
			<button class="bg-[#F0FDFF] hover:shadow-md text-white font-bold py-2 px-4 rounded-lg absolute bottom-4 transform inline-flex items-center ml-2 h-12 w-64 ">
				<div class="bg-white border-2 border-blue-800 rounded-full p-1 -ml-1">
				  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
					<rect fill="none" height="256" width="256"/>
					<path d="M158.7,163.5l-23.2,63.8a8,8,0,0,1-15,0L97.3,163.5a8.1,8.1,0,0,0-4.8-4.8L28.7,135.5a8,8,0,0,1,0-15L92.5,97.3a8.1,8.1,0,0,0,4.8-4.8l23.2-63.8a8,8,0,0,1,15,0l23.2,63.8a8.1,8.1,0,0,0,4.8,4.8l63.8,23.2a8,8,0,0,1,0,15l-63.8,23.2A8.1,8.1,0,0,0,158.7,163.5Z" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
				  </svg>
				</div>
				<span class="ml-5 text-[#4B5C69] font-medium">Upgrade to Premium</span>
			</button>
			  
			  
		</Sidebar>
</Drawer>
<div class="p-4 flex justify-between items-center">
	<div class="gap-2 flex justify-evenly items-center">
		<button on:click={() => (hidden2 = false)}>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M13.5 18H4M20 12H4M20 6H4"
					stroke={darkMode ? 'white' : '#004E86'}
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		<h1 class="text-2xl font-bold">AI Learning engine</h1>
	</div>
<div class="flex flex-row justify-center items-center gap-2">
{#if $loginStore.userName}
	<div class="flex flex-row justify-center items-center">
	<button>
	<img src={$loginStore.photoURL} class="h-8 w-8 rounded-full " referrerpolicy="no-referrer" alt=""/>
	</button>
	
	<Dropdown>
		<DropdownItem>{$loginStore.userName}</DropdownItem>
		<DropdownDivider/>
		<DropdownItem on:click={signOut} slots="footer">Sign out</DropdownItem>
	</Dropdown>
	</div>
{/if}
	
</div>
</div>