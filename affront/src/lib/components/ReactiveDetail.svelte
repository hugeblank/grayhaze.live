<script lang="ts">
    let { text, ok } = $props()
</script>

{#if text.length > 0}
    <p class="{ok ? "text-green-500" : "text-red-500"} text-xs italic my-1">{text}</p>
{/if}