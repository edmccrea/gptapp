<script lang="ts">
  let systemInput = "y";
</script>

<div class="flex flex-col items-center">
  <h1 class="font-bold text-6xl mt-14">GPT API</h1>
  <input
    class="mt-8 w-full lg:w-2/3 px-3 py-1 transition-all duration-300 focus:border-emerald-500 focus:border-[3px]"
    type="text"
    placeholder="System"
  />
  <button
    class="border border-gray-400 rounded-md mt-4 px-3 py-2 hover:bg-zinc-800 transition-all duration-300"
    >Set system</button
  >

  {#if systemInput}
    <div class="mt-10 h-2/3 w-full grid lg:grid-cols-2 gap-4">
      <textarea
        class="w-full h-[20rem] lg:h-[30rem] border border-gray-400 rounded-md p-2 overflow-auto transition-all duration-300 focus:border-emerald-500 focus:border-[3px]"
        placeholder="Input"
      />

      <textarea
        class="w-full border border-gray-400 rounded-md h-[20rem] lg:h-[30rem] p-2 overflow-auto"
        placeholder="Awaiting input..."
        readonly
      />
    </div>
  {/if}

  <button class="mt-4">Enter your API key</button>
</div>
