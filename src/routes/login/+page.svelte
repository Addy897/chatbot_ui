
<script>
    import { onMount } from 'svelte';
    import { firebaseConfig } from '$lib/firebase_config'; // Import Firebase config
    import { getApps, initializeApp } from 'firebase/app';
    import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
    import { setPersistence, browserSessionPersistence } from 'firebase/auth';
    import { browser } from '$app/environment';
    import { Button, Modal} from 'flowbite-svelte';
	import icon from '$lib/images/icon.png';

    let name = '';
    let email = '';
    let password = '';
    let user = null;
    let fApp = null;

    const googleSignIn = async () => {
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
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
            })        
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    };

    const handleSignup = async () => {
        const auth = getAuth();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            user = userCredential.user;
            // Optionally, update the user's profile with the username
            // user.updateProfile({ displayName: username });
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = '/';
        } catch (error) {
            console.error(error.code, error.message);
        }
    };

    onMount(() => {
        if (!getApps().length) {
            fApp = initializeApp(firebaseConfig, {
                experimentalForceLongPolling: true, // this line
                useFetchStreams: false
            });
        }

        const auth = getAuth();
        auth.onAuthStateChanged(currentUser => {
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
    });

    let darkMode = false;
    let formModal = true;
    function toggleDarkMode() {
        darkMode = !darkMode;
    }
</script>


<div class="{darkMode ? 'bg-[#222222]' : 'bg-light'} {darkMode ? 'text-light' : 'text-black'} w-full h-screen flex flex-col">
    <div class="p-4 flex justify-between items-center border-b-2">
        <div class="gap-2 flex justify-evenly items-center">
            <h1 class="text-2xl font-bold">AI Learning Engine</h1>
        </div>
        <button class="text-sm px-2 py-1 rounded-lg border border-gray-300 flex items-center" on:click={toggleDarkMode}>
            {#if darkMode}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
            {/if}
        </button>
    </div>

    <div class="flex flex-col justify-center items-center h-full">
        {#if user}
            {#if browser}
                {window.location.href = "/"}
            {/if}
        {:else}
            <Modal bind:open={formModal} dismissable={false} size="xs" autoclose={false}  class="w-full flex flex-col items-center border-2 justify-center rounded-xl border-[#004E86] bg-[#F4FCFF] p-4 px-12 text-center">
                
                <div class="text-2xl font-bold">AI Learning Engine</div>
                <div class="text-sm flex flex-col items-center justify-center">Powered By:<img src="{icon}" alt="#" class="w-32"></div>
                
                <div class="border-[#93B6CF] border-[1px] w-full ">
                    
                </div>
                <p class="font-semibold mb-6">Create your account and get started now !</p>
                <form class="flex flex-col gap-2 w-full justify-center" on:submit|preventDefault={handleSignup}>
                    <input type="email" placeholder="Name" bind:value={name} class="rounded-lg text-[14px]" required />
                    <input type="text" placeholder="Email" bind:value={email} class="rounded-lg text-[14px]" required />
                    <input type="password" placeholder="Password" bind:value={password} class="rounded-lg text-[14px]" required />
                    <button type="submit" class="w-full rounded-lg bg-[#294254] p-2 text-white text-center">Signup with Email</button>
                </form>
                <p class="font-bold pt-3">Or</p>
                <button on:click={googleSignIn} class="w-full text-center  select-none flex flex-row justify-center  gap-2 rounded-lg {darkMode?'bg-white text-black shadow-gray-500/10 hover:shadow-gray-100/20':'bg-black text-white shadow-gray-900/10 hover:shadow-gray-900/20'}  py-2 px-6 text-center items-center align-middle font-sans text-xs font-bold uppercase shadow-md   transition-all hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"><img
                    class="w-6 h-6"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    loading="lazy"
                    alt="google logo"
                  />
                  <span>Sign with Google</span>
                </button>
                <div class="link">
                    <p class="mb-2 -mt-2 font-medium">Already have an account ? <a href="/login" class="log_in">Log In</a></p>
                </div>
            </Modal>
        {/if}
    </div>
</div>