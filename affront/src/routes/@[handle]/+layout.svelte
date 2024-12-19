<script lang="ts">
    const { data, children } = $props();
</script>

<svelte:head>
    <title>GrayHaze - {data.focus.getName()}</title>
</svelte:head>

{@render children()}