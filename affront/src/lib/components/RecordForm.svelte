<script lang="ts" generics="T">
    import { enhance } from '$app/forms';
    import type { ATURI } from '$lib/ATURI';
    import type { Snippet } from 'svelte';

    const { uri, cid, name, children }: { uri: ATURI, cid?: string, name: string, children: Snippet<[]> } = $props()
</script>

<form method="POST" enctype="multipart/form-data" action="?/{name}" use:enhance>
    {#if cid} <input type="hidden" name="cid" value="{cid}"> {/if}
    <input type="hidden" name="uri" value="{uri}">
    {@render children()}
</form>