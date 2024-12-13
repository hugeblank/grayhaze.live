<script lang="ts" generics="T extends { id: string }">
    import type { Snippet } from 'svelte'
    const { items, renderer }: { items: T[], renderer: Snippet<[T]> } = $props()
</script>

<!-- Grid item aspect ratio is locked to 3/2 with a 16rem height (h-64). 16rem*(3/2) = 24rem, at a minimum. -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(24rem,1fr)_)] gap-x-2.5 gap-y-5 ml-2 mr-2">
    {#each items as item (item.id)}
        {@render renderer(item)}
    {/each}
</div>