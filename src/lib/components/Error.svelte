<script lang="ts">
  import { fade } from "svelte/transition";

  const errorMessage = "Something went wrong. Please try again.";
</script>

<div class="bg-red-300 absolute top-5 right-5 rounded-md" transition:fade>
  <div class="h-1 bg-red-500 rounded-t-md" />
  <div class="flex items-center px-2 py-1">
    <img src="/exclamation-circle.svg" alt="" /><span
      class="text-xs ml-1 text-red-700">{errorMessage}</span
    >
  </div>
</div>
