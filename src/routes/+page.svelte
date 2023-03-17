<script lang="ts">
  import { fly } from "svelte/transition";

  import Modal from "$lib/components/Modal.svelte";

  let apiKey = "";
  let systemInput = "";
  let disableSystemInput = false;
  let readyForInput = false;

  let showModal = false;

  function setSystem() {
    if (!apiKey) {
      showModal = true;
      return;
    }
    //Add system validation
    if (!systemInput) return;
    disableSystemInput = true;
    readyForInput = true;
  }
  function openModal() {
    showModal = true;
  }

  function setApiKey(event: CustomEvent) {
    apiKey = event.detail;
  }
</script>

{#if showModal}
  <Modal bind:open={showModal} on:setApiKey={setApiKey} />
{/if}

<div class="flex flex-col items-center">
  <h1 class="font-bold text-6xl mt-14">
    GPT <span class="font-gradient">API</span>
  </h1>
  <input
    class="mt-8 w-full lg:w-2/3 px-3 py-1 transition-all duration-300 focus:border-emerald-500 focus:border-[3px]"
    type="text"
    placeholder="Enter a system prompt..."
    disabled={disableSystemInput}
    bind:value={systemInput}
  />

  {#if !readyForInput}
    <button
      on:click={setSystem}
      class="border border-gray-400 rounded-md mt-4 px-3 py-2 hover:bg-emerald-400/10 transition-all duration-300"
      >Set system</button
    >
  {/if}

  {#if readyForInput}
    <div class="mt-10 h-2/3 w-full grid lg:grid-cols-2 gap-4" in:fly>
      <textarea
        class="bg-black/50 w-full h-[20rem] lg:h-[30rem] border border-gray-400 rounded-md p-2 overflow-auto transition-all duration-300 focus:border-emerald-500 focus:border-[3px]"
        placeholder="Input"
      />

      <textarea
        class="bg-black/50 w-full border border-gray-400 rounded-md h-[20rem] lg:h-[30rem] p-2 overflow-auto"
        placeholder="Awaiting input..."
        readonly
      />
    </div>

    <button
      class="border border-gray-400 rounded-md mt-4 px-3 py-2 hover:bg-emerald-400/10 transition-all duration-300"
      >Do the wizardy stuff</button
    >
  {/if}

  <button class="mt-4 underline" on:click={openModal}
    >{apiKey ? "Edit API key" : "Enter your API key"}</button
  >
</div>

<style>
  .font-gradient {
    background: linear-gradient(90deg, #6ee7b7 0%, #047857 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
