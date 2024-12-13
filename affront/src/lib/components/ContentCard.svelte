<script lang="ts" generics="T">
    import type { Callback } from '$lib/thumbnail';
    import type { WrappedRecord } from '$lib/WrappedRecord';
    import type { Snippet } from 'svelte';

    const { record, duration, thumbnail, children }: { record: WrappedRecord<T>, duration: string, thumbnail: string | ArrayBuffer | undefined , children: Snippet<[]> } = $props()
</script>

<div style="aspect-ratio: 3/2; background-image: url({thumbnail}); background-size: cover; background-position: center;" class="flex flex-col justify-end border rounded-lg border-solid border-gray-500 p-6 h-64">
    <div class="grow flex flex-col p-3 bg-black bg-opacity-60 rounded-lg justify-between">
        <div>
            {@render children()}
        </div>
        <div class="flex flex-row w-full justify-between">
            <div>
                <p class="text-gray-200">{record.uri.timestamp.toLocaleDateString()}</p>
                <p class="text-gray-200">{record.uri.timestamp.toLocaleTimeString()}</p>
            </div>
            <p class="text-gray-200 place-content-end">{duration}</p>
        </div>
    </div>
</div>