<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  export let open = false;
  let apiKey = "";

  const dispatch = createEventDispatcher();

  function closeModal() {
    open = false;
  }

  function setApiKey() {
    dispatch("setApiKey", apiKey);
    closeModal();
  }
</script>

{#if open}
  <div
    class="fixed top-0 left-0 h-full w-full bg-black/40 flex justify-center items-center"
    on:click={closeModal}
    on:keyup={closeModal}
  >
    <div
      class="bg-zinc-900 flex flex-col justify-center w-[500px] h-[150px] rounded-md relative"
      on:click|stopPropagation
      on:keyup|stopPropagation
      transition:fade={{ duration: 150 }}
    >
      <button class="absolute top-3 right-4" on:click={closeModal}
        ><svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 18L18 6M6 6L18 18"
            stroke="#fff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg></button
      >

      <form action="" on:submit|preventDefault={setApiKey}>
        <input
          type="password"
          placeholder="Enter your OpenAI API key..."
          class="w-4/5 px-3 py-1 focus:border-emerald-500 focus:border-[3px] transition-all duration-300 ml-[50px] "
          bind:value={apiKey}
        />
        <button class="ml-[50px] mt-2 underline w-fit" on:click={setApiKey}
          >Submit</button
        >
      </form>
    </div>
  </div>
{/if}
