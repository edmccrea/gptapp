<script lang="ts">
  // import { createEventDispatcher } from "svelte";

  // const dispatch = createEventDispatcher<{ selectModel: string }>();

  let selected: string;

  const models = [
    {
      name: "GPT-3.5",
      value: "gpt-3.5-turbo",
    },
    {
      name: "GPT-4",
      value: "gpt-4",
    },
  ];
</script>

<footer class="my-10 flex flex-col items-center relative w-full">
  <select
    bind:value={selected}
    name=""
    id=""
    class="bg-transparent w-fit lg:absolute lg:right-5 mb-5 border border-gray-400 rounded-md pl-3 pr-10 py-2 hover:cursor-pointer focus:outline-none"
  >
    {#each models as model}
      <option value={model.value}>{model.name}</option>
    {/each}
  </select>

  <p>
    Created by <a
      href="https://github.com/edmccrea"
      target="_blank"
      rel="noreferrer"
      class="underline text-emerald-300 font-bold">Ed McCrea</a
    >
  </p>
  <p>
    <a
      href="https://www.youtube.com/watch?v=dXsZp39L2Jk&t=625s"
      target="_blank"
      rel="noreferrer"
      class="underline">Inspiration</a
    >
    &#xB7;
    <a
      href="https://github.com/edmccrea"
      target="_blank"
      rel="noreferrer"
      class="underline">Source Code</a
    >
  </p>
</footer>

<style>
  select {
    appearance: none;
    background-image: url("/chevron-down.svg");
    background-repeat: no-repeat, repeat;
    background-position: right 0.7em top 50%, 0 0;
  }
</style>
