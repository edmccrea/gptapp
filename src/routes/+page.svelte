<script lang="ts">
  import { fly } from "svelte/transition";
  import { SSE } from "sse.js";
  import type { ChatCompletionRequestMessage } from "openai";
  // import { PUBLIC_ENV } from "$env/static/public";

  import Modal from "$lib/components/Modal.svelte";

  let apiKey = "";
  let systemInput = "";
  let disableSystemInput = false;
  let readyForInput = false;

  let query = "";
  let answer = "";
  let loading = false;
  let chatMessages: ChatCompletionRequestMessage[] = [];
  let scrollToDiv: HTMLElement;

  let showModal = false;

  function scrollToBottom() {
    setTimeout(function () {
      scrollToDiv.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 100);
  }

  function setSystem() {
    // if (PUBLIC_ENV !== "dev") {
    if (!apiKey) {
      showModal = true;
      return;
    }
    // }

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

  const handleSubmit = async () => {
    loading = true;
    chatMessages = [...chatMessages, { role: "user", content: query }];
    const eventSource = new SSE("/api/chat", {
      headers: {
        "Content-Type": "application/json",
      },
      payload: JSON.stringify({
        messages: chatMessages,
        key: apiKey,
        prompt: systemInput,
      }),
    });
    query = "";

    eventSource.addEventListener("error", handleError);
    eventSource.addEventListener("message", (e) => {
      scrollToBottom();
      try {
        loading = false;
        if (e.data === "[DONE]") {
          chatMessages = [
            ...chatMessages,
            { role: "assistant", content: answer },
          ];
          answer = "";
          return;
        }

        const completionResponse = JSON.parse(e.data);
        const [{ delta }] = completionResponse.choices;

        if (delta.content) {
          answer = (answer ?? "") + delta.content;
        }
      } catch (e) {
        handleError(e);
      }
    });

    eventSource.stream();
    scrollToBottom();
  };

  function handleError<T>(error: T) {
    loading = false;
    query = "";
    answer = "";
    //Use a toast notifcation here?
    console.error(error);
  }

  function reset() {
    chatMessages = [];
    answer = "";
    query = "";
    systemInput = "";
    disableSystemInput = false;
    readyForInput = false;
  }
</script>

{#if showModal}
  <Modal bind:open={showModal} on:setApiKey={setApiKey} />
{/if}

<div class="flex flex-col items-center">
  <h1 class="font-bold text-6xl mt-14">
    GPT <span class="font-gradient">API</span>
  </h1>

  <select
    name=""
    id=""
    class="bg-transparent absolute bottom-5 right-5 border border-gray-400 rounded-md px-3 py-2 hover:cursor-pointer focus:outline-none"
  >
    <option value="">v3.5</option>
    <option value="">v4 (Coming Soon)</option>
  </select>
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
      >Set system input</button
    >
  {/if}

  {#if readyForInput}
    {#if chatMessages.length}
      <div
        in:fly
        class="h-fit bg-black/50 w-full lg:w-2/3 border border-gray-400 rounded-md mt-5 p-4"
      >
        {#each chatMessages as message}
          {#if message.role === "user"}
            <p class="py-1">
              <span class="font-bold">You</span>: {message.content}
            </p>
          {:else}
            <p class="py-1">
              <span class="font-bold text-emerald-300">GPT</span>: {message.content}
            </p>
          {/if}
        {/each}
        {#if answer}
          <p class="py-1">
            <span class="font-bold text-emerald-300">GPT</span>: {answer}
          </p>
        {/if}
        {#if loading}
          <p class="py-1">
            <span class="font-bold text-emerald-300">GPT</span>: Beep boop...
          </p>
        {/if}
      </div>
    {/if}

    <form
      action=""
      on:submit={handleSubmit}
      class="w-full lg:w-2/3 flex flex-col items-center"
    >
      <input
        class="mt-8 w-full px-3 py-1 transition-all duration-300 focus:border-emerald-500 focus:border-[3px]"
        type="text"
        placeholder="Enter a message"
        disabled={loading}
        bind:value={query}
      />

      <button
        on:click|preventDefault={handleSubmit}
        class="border border-gray-400 rounded-md mt-4 px-3 py-2 hover:bg-emerald-400/10 transition-all duration-300 w-fit"
        >Do the wizardy stuff</button
      >
    </form>
  {/if}

  {#if chatMessages.length}
    <button on:click={reset} class="mt-4 underline">Reset</button>
  {:else}
    <button class="mt-4 underline" on:click={openModal}
      >{apiKey ? "Edit API key" : "Enter your API key"}</button
    >
  {/if}
</div>
<div bind:this={scrollToDiv} />

<style>
  .font-gradient {
    background: linear-gradient(90deg, #6ee7b7 0%, #047857 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
