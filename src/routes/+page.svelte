<script>
	import GetLink from "../lib/components/getLink.svelte";

  let messages = [];
  let inputValue = '';
  let darkMode = false;
  let sidebarVisible = true;
  let previousChats = {};
  let selectedChat = null;
  let imageLink=null;
  function sendMessage() {
      if (inputValue.trim() !== '') {
          messages = [...messages, { text: inputValue, isUser: true }];
          // Here you could send the message to your backend or process it
          inputValue = '';
      }
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
  }

  function selectChat(chat) {
      selectedChat = chat;
      messages = chat.messages
  }

  function removeChat(chatId) {
     delete previousChats[chatId]
     previousChats=previousChats
  }

  function saveChat() {
      if (messages.length > 0) {
          previousChats[messages[0].text || "Untitled"] = {messages:messages};
          // Optionally clear current messages after saving
      }
  }
  $:if(imageLink){
    messages = [...messages, { image: imageLink, isUser: true }];
    imageLink=null
  }
  function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Here you can handle the file upload, for example, send it to a server
            const imageURL = URL.createObjectURL(file);
            messages = [...messages, { image: imageURL, isUser: true }];
        }
    }
</script>

<div class="bg-{darkMode ? '[#222222]' : 'light'} text-{darkMode ? 'light' : 'black'} w-full h-screen flex">
  <!-- Sidebar -->
  <div class="sidebar absolute top-[68px] z-20 h-full bg-{darkMode ? 'dark' : 'white'} border-r-2 p-4  w-2/3 sm:w-1/3 md:w-1/3 lg:w-1/4 flex-1 flex flex-col overflow-y-auto { sidebarVisible ? '' : 'hidden' }">
      
      <button class="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg" on:click={createNewChat}>Create New Chat</button>
      {#each Object.entries(previousChats) as [chat,val]}
          <div class="mb-2">
              <button class="bg-{darkMode?"white":"black"} text-{darkMode?"black":"white"} hover:bg-gray-400 px-4 py-2 rounded-lg w-full truncate flex items-center justify-between gap-2" on:click={() => selectChat(val)}><span class="w-3/4 truncate">{chat}</span><button class=" text-red-900" on:click={() => removeChat(chat)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              </button></button>
              
          </div>
      {/each}
  </div>

  <!-- Main content -->
  <div class="flex flex-col flex-1">
      <!-- Header with dark mode switch -->
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


      <!-- Messages container -->
      <div class="flex-1 overflow-y-auto  p-4 border-t-2 border-gray-300">
        {#each messages as message}
            <div class="mb-2">
                {#if message.text}
                    <div class={message.isUser ? 'text-right' : 'text-left'}>
                        <span class="inline-block p-2 rounded-lg bg-gray-300 text-black text-sm ">{message.text}</span>
                    </div>
                {:else if message.image}
                    <div class="flex {message.isUser ? 'justify-end' : 'text-left'}">
                        <img src={message.image} alt="Uploaded_Image" class="max-w-xs" />
                    </div>
                {/if}
            </div>
        {/each}
    </div>

      <!-- Input field for new messages -->
      <div class="p-4 flex flex-col justify-between items-center gap-2">
        <div class=" flex flex-row w-full">
          <div class="relative w-full">
          <textarea
              class="w-full p-2 border border-gray-300 rounded-lg resize-none bg-{darkMode ? 'dark' : 'light'} outline-none"
              bind:value={inputValue}
          />
          <button class="absolute top-5 right-4" on:click={sendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            
          </button>
        </div>
        </div>

          <div class="flex flex-row">
            <button
            class="select-none rounded-lg bg-{darkMode?'white':'gray-900'} text-{darkMode?'black':'white'} py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button" data-dialog-target="sign-in-dialog">
            Upload Image
            </button>  
          <GetLink bind:imageLink={imageLink} ></GetLink>
          <button class="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg" on:click={saveChat}>Save Chat</button>
          </div>
      </div>
  </div>
</div>
