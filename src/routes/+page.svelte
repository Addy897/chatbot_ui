<script>
	import {onDestroy, onMount } from "svelte";
	import GetLink from "../lib/components/getLink.svelte";
	import { getAuth } from "firebase/auth";
  import { getApps, initializeApp } from "firebase/app";
  import { firebaseConfig } from '$lib/firebase_config'; // Import Firebase config
	import { browser } from "$app/environment";
  import { doc, setDoc,getFirestore, getDoc } from "firebase/firestore"; 
  import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

  let fApp=null
let user=null
let img_uuid=null
let image_link
  let messages = [];
  let inputValue = '';
  let darkMode = false;
  let sidebarVisible = false;
  let previousChats = {};
  let selectedChat = null;
  let imageLink=null;
  async function query(inputC) {
	const response = fetch("/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputC:inputC,image_link:image_link }),
          })
	const result = (await response).text()
	return result;
}

  async function sendMessage() {
      let inputC=inputValue
      if (inputValue.trim() !== '') {
          messages = [...messages, { text: inputValue, isUser: true }];
          inputValue = '';
      }
      messages = [...messages, { text: "...", isUser: false }];
      
      let res=await query(inputC)
      messages.pop()
      messages = [...messages, { text: res, isUser: false }];
      
      
  }

  function toggleDarkMode() {
      darkMode = !darkMode;
  }

  function toggleSidebar() {
      sidebarVisible = !sidebarVisible;
  }

  function createNewChat() {
      selectedChat = null;
      messages = [];
      if(user){
      img_uuid=`${user.uid}.${makeid(5)}`
      }
  }

  function selectChat(chat) {
      selectedChat = chat;
      messages = chat.messages
  }

  function removeChat(chatId) {
     delete previousChats[chatId]
     previousChats=previousChats
     saveChat()
  }

  function saveChat() {
      if (messages.length > 0) {
        let title=messages[0].text
        let i=0
        while(!title && i<messages.length){
          i+=1
          title=messages[i].text
          
        }
        previousChats[title] = {messages:messages};

      }
      fApp=initializeApp(firebaseConfig,{experimentalForceLongPolling: true, // this line
            useFetchStreams: false});
      const db = getFirestore(fApp);

setDoc(doc(db, "chats", user.uid), {allChats:previousChats});

  }
  let formModal=false
  $:if(imageLink){  
    image_link=imageLink
    messages = [...messages, { image: image_link, isUser: true }];

    imageLink=null
  }
  function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const storage = getStorage();
            const storageRef = ref(storage,img_uuid);
            const imageURL = URL.createObjectURL(file);
            messages = [...messages, { image: imageURL, isUser: true }];
            let i=messages.length-1
            uploadBytes(storageRef, file).then((snapshot) => {
              getDownloadURL(snapshot.ref).then((url)=>{
                image_link=url
                messages[i].image=image_link
               
               
              })
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
        if(!getApps().length){
            fApp=initializeApp(firebaseConfig,{experimentalForceLongPolling: true, // this line
            useFetchStreams: false});
        }
        getAuth().onAuthStateChanged(async currentUser => {
            user = currentUser;
            if (user) {
                localStorage.setItem('user',JSON.stringify(user))
                const db = getFirestore(fApp);
                const docRef = doc(db, "chats", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                  previousChats=docSnap.data().allChats
                  
                } else {
                  // docSnap.data() will be undefined in this case
                  
                }

                
            } else {
                if(browser){
                  window.location.href="/login"
                }
            }
        });
        
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user = JSON.parse(storedUser);
            img_uuid=`${user.uid}.${makeid(5)}`
        }else{
          if(browser){
            window.location.href="/login"
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
</script>

<div class="{darkMode?'bg-[#222222] text-light':'bg-light text-black'} w-full h-screen flex">
  <!-- Sidebar -->
  <div class="sidebar absolute top-[68px] z-20 h-full {darkMode ?'bg-dark':'bg-white'} border-r-2 p-4  w-2/3 sm:w-1/3 md:w-1/3 lg:w-1/4 flex-1 flex flex-col overflow-y-auto { sidebarVisible ? '' : 'hidden' }">
     {#if user} 
    <div
    class="{darkMode?'text-white':'text-black'}  flex flex-row px-3 py-2 rounded-md font-medium gap-2 items-center mb-4"
   
    ><img
    class="rounded-full h-7 w-7 "
    src={user.photoURL}
    alt=""
    referrerpolicy="no-referrer"
/>{user.displayName}</div
>    
{/if}
      <button class="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg {darkMode?' shadow-gray-500/10 hover:shadow-gray-100/20':'shadow-gray-900/10 hover:shadow-gray-900/20'} py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md  transition-all hover:shadow-lg  focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" on:click={createNewChat}>Create New Chat</button>
      {#each Object.entries(previousChats) as [chat,val]}
          <div class="mb-2">
              <button class="{darkMode?'bg-white text-black':'bg-black text-white'} {darkMode?' shadow-gray-500/10 hover:shadow-gray-100/20':'shadow-gray-900/10 hover:shadow-gray-900/20'} w-full rounded-lg py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md  transition-all hover:shadow-lg  focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none truncate flex items-center justify-between gap-2"><button class="inline-block w-[90%] truncate" on:click={() => selectChat(val)}>{chat}</button><button class="{darkMode ? 'text-red-900' : 'text-red-400'} z-20" on:click={() => removeChat(chat)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              </button></button>
              
          </div>
      {/each}
      <button class="mb-4 bg-blue-500 text-white {darkMode?' shadow-gray-500/10 hover:shadow-gray-100/20':'shadow-gray-900/10 hover:shadow-gray-900/20'} rounded-lg py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md  transition-all hover:shadow-lg  focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" on:click={signOut}>Logout</button>

  </div>

  <div class="flex flex-col flex-1">
      <div class="p-4 flex justify-between items-center">
        <div class="gap-2 flex justify-evenly items-center">
          <button on:click={toggleSidebar}>
          {#if sidebarVisible}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          
          {:else}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          
          {/if}
          </button>
          <h1 class="text-2xl font-bold">Medical Chatbot</h1>
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


      <div class="flex-1 overflow-y-auto p-4 border-t-2 border-gray-300 ">
        {#each messages as message}
            <div class="mb-2">
                {#if message.text}
                    <div class=" flex flex-row w-full {message.isUser ? 'text-right justify-end' : 'text-left justify-start'}" style="max-width: 98vw;">
                        <pre class="p-2 rounded-lg bg-gray-300 text-black text-sm text-wrap break-words overflow-hidden " >{message.text}</pre>
                    </div>
                {:else if message.image}
                    <div class="flex {message.isUser ? 'text-right justify-end' : 'text-left justify-start'}">
                        <img src={encodeURI(message.image)} alt="uploaded_image" size="max-w-xs"     referrerpolicy="no-referrer"
                        />
                    </div>
                {/if}
            </div>
        {/each}
    </div>

      <div class="p-4 flex flex-col justify-between items-center gap-2">
        <div class=" flex flex-row w-full">
          <div class="relative w-full">
          <textarea
              class="w-full p-2 border border-gray-300 rounded-lg resize-none {darkMode ? 'bg-dark' : 'bg-light'} outline-none"
              bind:value={inputValue}
          />
          <button class="absolute top-5 right-4" on:click={sendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            
          </button>
        </div>
        </div>

          <div class="flex flex-row gap-2">
            <button
            class="rounded-lg {darkMode?'bg-white text-black shadow-gray-500/10 hover:shadow-gray-100/20':'bg-gray-900 text-white shadow-gray-900/10 hover:shadow-gray-900/20'}  py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md  transition-all hover:shadow-lg  focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            on:click={()=>{formModal=true}}
            >
            Upload Image Link
            </button>
            <label class="rounded-lg {darkMode?'bg-white text-black shadow-gray-500/10 hover:shadow-gray-100/20':'bg-gray-900 text-white shadow-gray-900/10 hover:shadow-gray-900/20'}  py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md  transition-all hover:shadow-lg  focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
						  Upload Image
						  <input type="file" id="image" accept="image/*" class="hidden" on:change={handleFileUpload} >
						</label>   
          <GetLink bind:imageLink={imageLink} bind:formModal={formModal} ></GetLink>
          <button class="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg {darkMode?' shadow-gray-500/10 hover:shadow-gray-100/20':'shadow-gray-900/10 hover:shadow-gray-900/20'} py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md  transition-all hover:shadow-lg  focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" on:click={saveChat}>Save Chat</button>
          </div>
      </div>
  </div>
</div>
