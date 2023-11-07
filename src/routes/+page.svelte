<script lang="ts">
  import { get } from "svelte/store";
  import { fly } from "svelte/transition";
  import { SSE } from "sse.js";
  import type { ChatCompletionRequestMessage } from "openai";

  import Modal from "$lib/components/Modal.svelte";
  import Error from "$lib/components/Error.svelte";
  import { currentModel } from "$lib/stores/current-model";

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
  let error = false;

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
    if (!apiKey) {
      showModal = true;
      return;
    }

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
        model: get(currentModel),
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
          let formattedContent = delta.content.replace(/\n/g, "<br>");
          answer = (answer ?? "") + formattedContent;
        }
      } catch (e) {
        handleError(e);
      }
    });

    eventSource.stream();
    scrollToBottom();
  };

  function handleError<T>(err: T) {
    loading = false;
    query = "";
    answer = "";
    console.error(err);
    error = true;
    setTimeout(() => {
      error = false;
    }, 5000);
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

{#if error}
  <Error />
{/if}

<div class="flex flex-col items-center">
  <h1 class="font-bold text-6xl mt-14">
    GPT <span class="font-gradient">API</span>
  </h1>
  <form
    action=""
    class="w-full lg:w-2/3 flex flex-col items-center"
    on:submit|preventDefault={setSystem}
  >
    <input
      class="mt-8 w-full px-3 py-1 transition-all duration-300 focus:border-emerald-500 focus:border-[3px]"
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
  </form>

  {#if readyForInput}
    {#if chatMessages.length}
      <div
        in:fly
        class="h-fit bg-black/50 w-full lg:w-2/3 border border-gray-400 rounded-md mt-5 p-4"
      >
        {#each chatMessages as message}
          {#if message.role === "user"}
            <div class="py-2 flex">
              <div
                class=" mr-4 w-[30px] h-[30px] min-w-[30px] flex items-center justify-center rounded-sm bg-emerald-700"
              >
                You
              </div>
              <div>{@html message.content}</div>
            </div>
          {:else}
            <div class="py-2 flex">
              <div
                class=" text-emerald-300 mr-4 w-[30px] h-[30px] min-w-[30px] flex items-center justify-center rounded-sm bg-emerald-500"
              >
                <img src="/openai.svg" alt="" />
              </div>
              <div>{@html message.content}</div>
            </div>
          {/if}
        {/each}
        {#if answer}
          <div class="py-2 flex">
            <div
              class=" text-emerald-300 mr-4 w-[30px] h-[30px] min-w-[30px] flex items-center justify-center rounded-sm bg-emerald-500"
            >
              <img src="/openai.svg" alt="" />
            </div>
            <div>{@html answer}</div>
          </div>
        {/if}
        {#if loading}
          <div class="py-2 flex">
            <div
              class=" text-emerald-300 mr-4 w-[30px] h-[30px] min-w-[30px] flex items-center justify-center rounded-sm bg-emerald-500"
            >
              <img src="/openai.svg" alt="" />
            </div>
            <div>Beep boop...</div>
          </div>
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
        class="border border-gray-400 rounded-md mt-4 px-3 py-2 hover:bg-emerald-400/10 transition-all duration-300 w-fit disabled:bg-black disabled:text-gray-400"
        disabled={loading || !query}
        >{loading
          ? "Loading..."
          : !query
          ? "Enter a prompt"
          : "Do the wizardy stuff"}</button
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
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
