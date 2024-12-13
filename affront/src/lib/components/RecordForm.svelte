<script lang="ts" generics="T">
    import type { WrappedRecord } from '$lib/WrappedRecord';
    import type { Snippet } from 'svelte';

    const { record, name, children }: { record: WrappedRecord<T>, name: string, children: Snippet<[]> } = $props()
</script>

<form method="POST" action="?/{name}">
    <input type="hidden" name="cid" value="{record.cid}">
    <input type="hidden" name="uri" value="{record.uri}">
    {@render children()}
</form>