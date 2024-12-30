<script lang="ts" generics="T extends { uri: ATURI }">
    import { ATURI } from '$lib/ATURI';
    import type { Snippet } from 'svelte'
    const { items, renderer }: { items: T[], renderer: Snippet<[T]> } = $props()
</script>

<div class="grid grid-cols-[repeat(auto-fill,24rem_)] justify-center gap-x-2 gap-y-3 mx-8">
    {#each items as item (item.uri.rkey)}
        {@render renderer(item)}
    {/each}
</div>