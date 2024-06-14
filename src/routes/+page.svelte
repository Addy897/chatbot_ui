<script>
	import { onDestroy, onMount } from 'svelte';
	import GetLink from '$lib/components/getLink.svelte';
	import { getAuth } from 'firebase/auth';
	import { Card, Dropdown, DropdownDivider, DropdownItem, SpeedDial, SpeedDialButton } from 'flowbite-svelte';
	import { getApps, initializeApp } from 'firebase/app';
	import { firebaseConfig } from '$lib/firebase_config'; // Import Firebase config
	import { browser } from '$app/environment';
	import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
	import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
	import {
		Drawer,
		Button,
		CloseButton,
		Sidebar,
		SidebarBrand,
		SidebarCta,
		SidebarDropdownItem,
		SidebarDropdownWrapper,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import icon from '$lib/images/icon.png';
	let spanClass = 'flex-1 ms-3 whitespace-nowrap';
	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};
	let fApp = null;
	let user = null;
	let img_uuid = null;
	let image_link;
	let messages = [];
	let inputValue = '';
	let darkMode = false;
	let sidebarVisible = false;
	let previousChats = {};
	let selectedChat = null;
	let imageLink = null;
	async function query(inputC) {
		const response = fetch('/query', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ inputC: inputC, image_link: image_link })
		});
		const result = (await response).text();
		return result;
	}

	async function sendMessage() {
		let inputC = inputValue;
		if (inputValue.trim() !== '') {
			messages = [...messages, { text: inputValue, isUser: true }];
			inputValue = '';
		}
		messages = [...messages, { text: '...', isUser: false }];

		let res = await query(inputC);
		messages.pop();
		messages = [...messages, { text: res, isUser: false }];
	}

	function toggleDarkMode() {
		darkMode = !darkMode;
	}

	function toggleSidebar() {
		hidden2 = !hidden2;
	}

	function createNewChat() {
    toggleSidebar()
    page=0
		selectedChat = null;
		messages = [];
		if (user) {
			img_uuid = `${user.uid}.${makeid(5)}`;
		}
	}

	function selectChat(chat) {
		selectedChat = chat;
		messages = chat.messages;
	}

	function removeChat(chatId) {
		delete previousChats[chatId];
		previousChats = previousChats;
		saveChat();
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
	let formModal = false;
	$: if (imageLink) {
		image_link = imageLink;
		messages = [...messages, { image: image_link, isUser: true }];

		imageLink = null;
	}
	function handleFileUpload(event) {
		const file = event.target.files[0];
		if (file) {
			const storage = getStorage();
			const storageRef = ref(storage, img_uuid);
			const imageURL = URL.createObjectURL(file);
			messages = [...messages, { image: imageURL, isUser: true }];
			let i = messages.length - 1;
			uploadBytes(storageRef, file).then((snapshot) => {
				getDownloadURL(snapshot.ref).then((url) => {
					image_link = url;
					messages[i].image = image_link;
				});
			});
		}
	}
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
				experimentalForceLongPolling: true, // this line
				useFetchStreams: false
			});
		}
		getAuth().onAuthStateChanged(async (currentUser) => {
			user = currentUser;
			if (user) {
				localStorage.setItem('user', JSON.stringify(user));
				const db = getFirestore(fApp);
				const docRef = doc(db, 'chats', user.uid);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					previousChats = docSnap.data().allChats;
				} else {
					// docSnap.data() will be undefined in this case
				}
			} else {
				if (browser) {
					window.location.href = '/login';
				}
			}
		});

		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			user = JSON.parse(storedUser);
			img_uuid = `${user.uid}.${makeid(5)}`;
		} else {
			if (browser) {
				window.location.href = '/login';
			}
		}
	});
	const signOut = async () => {
		try {
			await getAuth().signOut();
			user = null;
			localStorage.removeItem('user'); // Remove user data from local storage on sign-out
		} catch (error) {
			console.error(error.message);
		}
	};
	let hidden2 = true;
  let page=0;
</script>

<div class="{darkMode ? 'bg-[#222222] text-light' : 'bg-light text-black'} w-full h-screen flex">
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
					class="text-base text-black uppercase dark:text-gray-400 font-bold"
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
				<span class="text-xs">Powered By</span>
				<div>
					<img src={icon} alt="" class="h-8" />
				</div>
			</div>
		</div>
		<div class="w-full border-[1px] border-[#93B6CF]"></div>
		<Sidebar>
			<SidebarWrapper
				divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800 flex flex-col gap-2"
			>
				<SidebarGroup>
					<div class="flex flex-row justify-between w-full">
						<button on:click={() => (hidden2 = true)}>
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
						<button on:click={createNewChat}>
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
						label="Ask"
						on:click={()=>{toggleSidebar();page=0;}}
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
					<SidebarItem label="Notes" {spanClass} on:click={()=>{page=1;toggleSidebar()}}>
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
					<SidebarItem label="Learn" {spanClass}  on:click={()=>{page=2;toggleSidebar()}}>
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
					<SidebarItem label="Assessment"  on:click={()=>{page=3;toggleSidebar()}}>
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
			<SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800 flex flex-col gap-2 w-full">
       
				{#each Object.entries(previousChats) as [chat, val]}
        <SidebarGroup>
						<div
             
							class="{darkMode ? 'bg-white text-black' : 'bg-white text-black'} {darkMode
								? ' shadow-gray-500/10 hover:shadow-gray-100/20'
								: 'shadow-gray-900/10 hover:shadow-gray-900/20'} w-full rounded-lg py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none truncate flex items-center justify-between gap-2"
							><button class="inline-block w-full truncate" on:click={() => {selectChat(val);toggleSidebar();page=0}}
								>{chat}</button
							><button
								class="{darkMode ? 'text-red-900' : 'text-red-400'} z-20"
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
		</Sidebar>
	</Drawer>
  <div class="flex flex-col flex-1">
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
      <div class="flex flex-row justify-center items-center gap-2 ">
        {#if user}
          <div class="flex flex-row justify-center items-center">
            <button>
            <img src={user.photoURL} class="h-8 w-8 rounded-full " referrerpolicy="no-referrer" alt=""/>
            </button>
            
            <Dropdown>
              <DropdownItem>{user.displayName}</DropdownItem>
              <DropdownDivider/>
              <DropdownItem on:click={signOut} slots="footer">Sign out</DropdownItem>
            </Dropdown>
          </div>
        {/if}
			<button
				class="text-sm px-2 py-1 rounded-lg border border-gray-300 flex items-center"
				on:click={toggleDarkMode}
			>
				{#if darkMode}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
						/>
					</svg>
				{/if}
			</button>
    </div>
		</div>
  {#if page==0}
	
		
    {#if messages.length>0}
		<div class="flex-1 overflow-y-auto p-4">
			{#each messages as message}
				<div class="mb-2">
					{#if message.text}
						<div
							class=" flex flex-row w-full {message.isUser
								? 'text-right justify-end'
								: 'text-left justify-start'}"
							style="max-width: 98vw;"
						>
							<pre
								class="p-2 rounded-lg bg-gray-300 text-black text-sm text-wrap break-words overflow-hidden">{message.text}</pre>
						</div>
					{:else if message.image}
						<div
							class="flex {message.isUser ? 'text-right justify-end' : 'text-left justify-start'}"
						>
							<img
								src={encodeURI(message.image)}
                class="max-w-xs"
								alt="uploaded_image"
								size="max-w-xs"
								referrerpolicy="no-referrer"
							/>
						</div>
					{/if}
				</div>
			{/each}
		</div>
    {:else}
      <div class="flex flex-col justify-center items-center h-full gap-4">
        <img src={icon} alt="" class="w-48"/>
        {#if user}
        <div class="text-[#5786B2]">
          Welcome {user.displayName}
        </div>
        {/if}
        <div class="grid grid-cols-3 gap-2">
          <Card class="flex flex-col justify-start bg-[#FEFFED] cursor-pointer" on:click={()=>{inputValue="About Urinary Systems"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_238_1292)">
              <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#67AD4E"/>
              <path d="M14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="#67AD4E"/>
              </g>
              <defs>
              <clipPath id="clip0_238_1292">
              <rect width="24" height="24" fill="white"/>
              </clipPath>
              </defs>
              </svg>
              
                        <h5 class="mb-2 tracking-tight text-gray-900 dark:text-white">About Urinary Systems</h5>
                        
          </Card>
          <Card class="flex flex-col justify-start bg-[#FFF0F0] cursor-pointer" on:click={()=>{inputValue="Create notes on nursing theories"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_238_1293)">
              <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z" fill="#D17164"/>
              <path d="M17.5 10.5C18.38 10.5 19.23 10.59 20 10.76V9.24C19.21 9.09 18.36 9 17.5 9C15.8 9 14.26 9.29 13 9.83V11.49C14.13 10.85 15.7 10.5 17.5 10.5Z" fill="#D17164"/>
              <path d="M13 12.4902V14.1502C14.13 13.5102 15.7 13.1602 17.5 13.1602C18.38 13.1602 19.23 13.2502 20 13.4202V11.9002C19.21 11.7502 18.36 11.6602 17.5 11.6602C15.8 11.6602 14.26 11.9602 13 12.4902Z" fill="#D17164"/>
              <path d="M17.5 14.3301C15.8 14.3301 14.26 14.6201 13 15.1601V16.8201C14.13 16.1801 15.7 15.8301 17.5 15.8301C18.38 15.8301 19.23 15.9201 20 16.0901V14.5701C19.21 14.4101 18.36 14.3301 17.5 14.3301Z" fill="#D17164"/>
              </g>
              <defs>
              <clipPath id="clip0_238_1293">
              <rect width="24" height="24" fill="white"/>
              </clipPath>
              </defs>
              </svg>
              
              
                        <h5 class="mb-2 tracking-tight text-gray-900 dark:text-white">Create notes on nursing theories</h5>
                        
          </Card>
          <Card class="flex flex-col justify-start bg-[#F5FFF2] cursor-pointer" on:click={()=>{inputValue="Pathophysiology main concepts?"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_238_1294)">
              <path d="M3.84004 4H19.2V16H4.96324L3.84004 17.17V4ZM3.84004 2C2.78404 2 1.92964 2.9 1.92964 4L1.92004 22L5.76004 18H19.2C20.256 18 21.12 17.1 21.12 16V4C21.12 2.9 20.256 2 19.2 2H3.84004ZM5.76004 12H17.28V14H5.76004V12ZM5.76004 9H17.28V11H5.76004V9ZM5.76004 6H17.28V8H5.76004V6Z" fill="#D5CC2A"/>
              </g>
              <defs>
              <clipPath id="clip0_238_1294">
              <rect width="23.04" height="24" fill="white"/>
              </clipPath>
              </defs>
              </svg>
              
              
                        <h5 class="mb-2 tracking-tight text-gray-900 dark:text-white">Pathophysiology main concepts?</h5>
                        
          </Card>
          
        </div>
      </div>
    {/if}

		<div class="p-4 flex flex-col justify-center items-center gap-2">
			<div class=" flex flex-row w-full justify-center">
				<div class="flex w-full justify-center">
					<div class="relative w-3/4">
						<SpeedDial defaultClass="absolute top-[0.90rem] left-4" trigger="click">
							<button slot="button">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9.85714 7.92854V13.9285C9.85714 15.112 10.8165 16.0714 12 16.0714C13.1835 16.0714 14.1429 15.112 14.1429 13.9285V7.71425C14.1429 5.46566 12.32 3.64282 10.0714 3.64282C7.82284 3.64282 6 5.46566 6 7.71425V14.3571C6 17.6708 8.68629 20.3571 12 20.3571C15.3137 20.3571 18 17.6708 18 14.3571V7.92854"
										stroke="black"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
							<SpeedDialButton
								name="Upload Link"
								on:click={() => {
									formModal = true;
								}}
							>
								<svg
									width="18"
									height="20"
									viewBox="0 0 18 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M2.28 11.06H6.28C7.54098 11.0377 8.58266 12.0391 8.61 13.3V17.3C8.60452 18.5625 7.58246 19.5845 6.32 19.59H2.32C1.05907 19.6067 0.0219162 18.6009 0 17.34V13.34C0 12.0808 1.02079 11.06 2.28 11.06ZM6.28 18.09C6.71631 18.09 7.07 17.7363 7.07 17.3V13.3C7.07002 13.0914 6.98647 12.8915 6.83802 12.7449C6.68957 12.5983 6.4886 12.5173 6.28 12.52H2.28C2.07313 12.52 1.87474 12.6022 1.72846 12.7485C1.58218 12.8947 1.5 13.0931 1.5 13.3V17.3C1.49997 17.7324 1.84761 18.0845 2.28 18.09H6.28Z"
										fill="black"
									/>
									<path
										d="M5.62 14.57C5.3052 14.57 5.05 14.3148 5.05 14C5.05 13.5858 4.71421 13.25 4.3 13.25C3.88579 13.25 3.55 13.5858 3.55 14V14.01C3.55 14.3193 3.29928 14.57 2.99 14.57C2.57579 14.57 2.24 14.9058 2.24 15.32C2.24 15.7342 2.57579 16.07 2.99 16.07C3.3048 16.07 3.56 16.3252 3.56 16.64V16.65C3.56 17.0642 3.89579 17.4 4.31 17.4C4.72421 17.4 5.06 17.0642 5.06 16.65C5.06 16.3297 5.31968 16.07 5.64 16.07C6.05421 16.07 6.39 15.7342 6.39 15.32C6.39 14.9058 6.05421 14.57 5.64 14.57H5.62Z"
										fill="black"
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M10.04 0.22L17.04 7.22C17.1888 7.37153 17.2684 7.57779 17.26 7.79V14.79C17.26 17.4134 15.1334 19.54 12.51 19.54H9.64C9.22579 19.54 8.89 19.2042 8.89 18.79C8.89 18.3758 9.22579 18.04 9.64 18.04H12.51C14.3049 18.04 15.76 16.5849 15.76 14.79V12.54C15.76 10.3309 13.9691 8.54 11.76 8.54H11.51C9.99122 8.54 8.76 7.30878 8.76 5.79V3.78C8.76 2.53736 7.75264 1.53 6.51 1.53C4.71346 1.53551 3.25999 2.99345 3.26 4.79V9.79C3.26 10.2042 2.92421 10.54 2.51 10.54C2.09579 10.54 1.76 10.2042 1.76 9.79V4.79C1.74933 3.52331 2.24506 2.30482 3.13702 1.40535C4.02898 0.505887 5.24326 -4.49127e-05 6.51 2.99042e-09H9.51C9.70885 0.000175055 9.89948 0.0793075 10.04 0.22ZM12.495 4.795C11.6702 3.97023 10.26 4.55436 10.26 5.72077V5.79C10.2655 6.47645 10.8235 7.03002 11.51 7.03H11.5692C12.7356 7.03 13.3198 5.61977 12.495 4.795Z"
										fill="black"
									/>
								</svg>
							</SpeedDialButton>
							<SpeedDialButton name="Uplaod Image">
								<label for="profile">
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M8.12 10.08C9.22457 10.08 10.12 9.18457 10.12 8.08C10.12 6.97543 9.22457 6.08 8.12 6.08C7.01543 6.08 6.12 6.97543 6.12 8.08C6.12 9.18457 7.01543 10.08 8.12 10.08Z"
											fill="black"
										/>
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.24 2H10C5.58172 2 2 5.58172 2 10V14.24C2 18.6583 5.58172 22.24 10 22.24H14.24C18.6583 22.24 22.24 18.6583 22.24 14.24V10C22.24 7.87827 21.3971 5.84344 19.8969 4.34315C18.3966 2.84285 16.3617 2 14.24 2ZM10 3.5H14.24C17.4859 3.50507 20.2306 5.90396 20.67 9.12H19.12C14.9468 9.1234 11.0879 11.3382 8.98 14.94C7.66362 13.8943 6.03116 13.3267 4.35 13.33H3.5V10C3.50551 6.41243 6.41243 3.50551 10 3.5ZM4.35 14.83H3.53C3.74723 17.1883 5.22988 19.2418 7.4 20.19C7.47167 18.8552 7.77274 17.5426 8.29 16.31C7.19845 15.3571 5.79895 14.8314 4.35 14.83ZM14.24 20.74H10C9.62404 20.7385 9.24906 20.7017 8.88 20.63C9.00486 15.0613 13.55 10.6095 19.12 10.6H20.74V14.24C20.7345 17.8276 17.8276 20.7345 14.24 20.74Z"
											fill="black"
										/>
									</svg>
									<input
										type="file"
										id="profile"
										accept="image/*"
										class="hidden"
										on:change={handleFileUpload}
									/>
								</label>
							</SpeedDialButton>
						</SpeedDial>
						<textarea
							class="w-full pl-12 pt-3 border border-gray-300 rounded-full h-3/4 resize-none bg-[#DEEDF3] outline-none"
							placeholder="Ask me anything.."
							bind:value={inputValue}
						/>

						<button class="absolute top-[0.90rem] right-4" on:click={sendMessage}>
							<svg
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
									d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<div class="flex flex-row gap-2">
				<GetLink bind:imageLink bind:formModal></GetLink>
				<button
					class="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg {darkMode
						? ' shadow-gray-500/10 hover:shadow-gray-100/20'
						: 'shadow-gray-900/10 hover:shadow-gray-900/20'} py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
					on:click={saveChat}>Save Chat</button
				>
			</div>
		</div>
	
  {:else}
    <div class="flex flex-col">
      <div class="w-full flex justify-center items-center font-mono text-2xl">Coming Soon</div>
    </div>
  
    <div class="flex flex-col"></div>
  
  {/if}
  </div>
</div>
