<script lang="ts" generics="T">
    import { enhance } from '$app/forms';
    import type { WrappedRecord } from '$lib/WrappedRecord';
    import type { Snippet } from 'svelte';

    const { record, name, children }: { record: WrappedRecord<T>, name: string, children: Snippet<[]> } = $props()
    // TODO: Maybe add use:enhance back to the form if a full page refresh is too annoying
</script>

<form method="POST" enctype="multipart/form-data" action="?/{name}">
    <input type="hidden" name="cid" value="{record.cid}">
    <input type="hidden" name="uri" value="{record.uri}">
    {@render children()}
</form>