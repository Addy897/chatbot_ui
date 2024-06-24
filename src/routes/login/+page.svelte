<script>
	import { onMount } from 'svelte';
	import { firebaseConfig } from '$lib/firebase_config';
	import { getApps, initializeApp } from 'firebase/app';
	import {
		getAuth,
		signInWithPopup,
		GoogleAuthProvider,
		createUserWithEmailAndPassword,
		updateProfile,
		signInWithEmailAndPassword
	} from 'firebase/auth';
	import { setPersistence, browserSessionPersistence } from 'firebase/auth';
	import { browser } from '$app/environment';
	import { Modal, Toast } from 'flowbite-svelte';
	import { CloseCircleSolid } from 'flowbite-svelte-icons';
	import icon from '$lib/images/icon.png';

	let name = '';
	let email = '';
	let password = '';
	let user = null;
	let fApp = null;
	let termsAccepted = false; // Added variable to track checkbox state
	let signUp = true;
	let err = null;
	const googleSignIn = async () => {
		if (!termsAccepted) return; // Prevent sign-in if terms not accepted

		const provider = new GoogleAuthProvider();
		const auth = getAuth();

		setPersistence(auth, browserSessionPersistence)
			.then(() => {
				return signInWithPopup(auth, provider);
			})
			.then((result) => {
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				user = result.user;
				localStorage.setItem('user', JSON.stringify(user));
				window.location.href = '/';
			})
			.catch((error) => {
				err = error;
				const email = error.customData.email;
				const credential = GoogleAuthProvider.credentialFromError(error);
			})
			.catch((error) => {
				err = error;
			});
	};

	const handleSignup = async () => {
		if (!termsAccepted) return;

		const auth = getAuth();

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			user = userCredential.user;
			localStorage.setItem('user', JSON.stringify(user));
			await updateProfile(auth.currentUser, {
				displayName: name,
				photoURL: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
			})
				.then(() => {})
				.catch((error) => {
					err = error;
				});
			window.location.href = '/';
		} catch (error) {
			err = error;
		}
	};
	const handleSignIn = async () => {
		if (!termsAccepted) return;

		const auth = getAuth();

		try {
			await signInWithEmailAndPassword(auth, email, password)
				.then((userCredential) => {
					user = userCredential.user;
					localStorage.setItem('user', JSON.stringify(user));
					window.location.href = '/';
				})
				.catch((error) => {
					err = error;
				});
		} catch (error) {
			err = error;
		}
	};

	onMount(() => {
		if (!getApps().length) {
			fApp = initializeApp(firebaseConfig, {
				experimentalForceLongPolling: true,
				useFetchStreams: false
			});
		}

		const auth = getAuth();
		auth.onAuthStateChanged((currentUser) => {
			user = currentUser;
			if (user) {
				localStorage.setItem('user', JSON.stringify(user));
			} else {
				localStorage.removeItem('user');
			}
		});

		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			user = JSON.parse(storedUser);
		}
		const termsCheckbox = document.getElementById('terms');
		const signInBtn = document.getElementById('signInBtn');

		termsCheckbox.addEventListener('change', function () {
			termsAccepted = termsCheckbox.checked;

			if (termsAccepted) {
				signInBtn.disabled = false;
				signInBtn.classList.remove('opacity-50', 'cursor-not-allowed');
			} else {
				signInBtn.disabled = true;
				signInBtn.classList.add('opacity-50', 'cursor-allowed');
			}
		});
	});

	let darkMode = false;
	let formModal = user == null;
</script>

<div
	class="{darkMode ? 'bg-[#222222]' : 'bg-light'} {darkMode
		? 'text-light'
		: 'text-black'} w-full h-screen flex flex-col"
>
	<div class="flex flex-col justify-center items-center h-full">
		{#if user}
			{#if browser}
				{(window.location.href = '/')}
			{/if}
		{:else}
			<Modal
				bind:open={formModal}
				dismissable={false}
				size="xs"
				autoclose={false}
				class="w-full flex flex-col items-center border-2 justify-center rounded-xl border-[#004E86] bg-[#F4FCFF] p-4 px-12 text-center"
			>
				{#if err}
					<Toast color="red">
						<svelte:fragment slot="icon">
							<CloseCircleSolid class="w-5 h-5" />
							<span class="sr-only">{err.Code}</span>
						</svelte:fragment>
						{err.message}
					</Toast>
				{/if}
				<div class="text-2xl font-bold">AI Learning Engine</div>
				<div class="text-sm flex flex-col items-center justify-center">
					Powered By:<img src={icon} alt="#" class="w-32" />
				</div>

				<div class="border-[#93B6CF] border-[1px] w-full"></div>
				{#if signUp}
					<p class="font-semibold mb-6">Create your account and get started now!</p>
					<form
						class="flex flex-col gap-2 w-full justify-center"
						on:submit|preventDefault={handleSignup}
					>
						<input
							type="text"
							placeholder="Name"
							bind:value={name}
							class="rounded-lg text-[14px]"
							required
						/>
						<input
							type="email"
							placeholder="Email"
							bind:value={email}
							class="rounded-lg text-[14px]"
							required
						/>
						<input
							type="password"
							placeholder="Password"
							bind:value={password}
							class="rounded-lg text-[14px]"
							required
						/>
						<div class="flex items-start pt-1 pb-1">
							<input type="checkbox" id="terms" bind:checked={termsAccepted} required />
							<!-- Added checkbox with binding -->
							<label for="terms" class="ml-2 text-xs text-left"
								>I acknowledge that this is a learning model and information provided is for
								educational purpose only.</label
							>
						</div>
						<button
							type="submit"
							class="w-full rounded-lg bg-[#294254] p-2 text-white text-center"
							disabled={!termsAccepted}>Signup with Email</button
						>
						<!-- Disable button if terms not accepted -->
					</form>
				{:else}
					<p class="font-semibold mb-6">SignIn to your account!</p>
					<form
						class="flex flex-col gap-2 w-full justify-center"
						on:submit|preventDefault={handleSignIn}
					>
						<input
							type="email"
							placeholder="Email"
							bind:value={email}
							class="rounded-lg text-[14px]"
							required
						/>
						<input
							type="password"
							placeholder="Password"
							bind:value={password}
							class="rounded-lg text-[14px]"
							required
						/>
						<div class="flex items-start pt-1 pb-1">
							<input type="checkbox" id="terms" bind:checked={termsAccepted} required />
							<!-- Added checkbox with binding -->
							<label for="terms" class="ml-2 text-xs text-left"
								>I acknowledge that this is a learning model and information provided is for
								educational purpose only.</label
							>
						</div>
						<button
							type="submit"
							class="w-full rounded-lg bg-[#294254] p-2 text-white text-center"
							disabled={!termsAccepted}>Signup with Email</button
						>
						<!-- Disable button if terms not accepted -->
					</form>
				{/if}
				<p class="font-bold -pt-2">Or</p>
				<button
					on:click={googleSignIn}
					class="w-full text-center select-none flex flex-row justify-center gap-2 rounded-lg {darkMode
						? 'bg-white text-black shadow-gray-500/10 hover:shadow-gray-100/20'
						: 'bg-black text-white shadow-gray-900/10 hover:shadow-gray-900/20'} py-2 px-6 text-center items-center align-middle font-sans text-md font-bold shadow-md transition-all hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
					disabled={!termsAccepted}
				>
					<img
						class="w-6 h-6"
						src="https://www.svgrepo.com/show/475656/google-color.svg"
						loading="lazy"
						alt="google logo"
					/>
					<span>Sign with Google</span>
				</button>
				<!-- Disable button if terms not accepted -->
				<div class="link">
					<p class="mb-2 -mt-2 font-medium">
						Already have an account? <a
							href="/login"
							class="text-blue-600"
							on:click={() => {
								signUp = !signUp;
							}}>Log In</a
						>
					</p>
				</div>
			</Modal>
		{/if}
	</div>
</div>
