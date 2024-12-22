<script lang="ts" generics="T">
    import type { WrappedRecord } from '$lib/WrappedRecord';
    import type { Snippet } from 'svelte';

    const { record, duration, thumbnail, live, children }: { record: WrappedRecord<T>, duration: string, thumbnail: string | ArrayBuffer | undefined, live: boolean , children: Snippet<[]> } = $props()
</script>

<div class="flex flex-col justify-end border rounded-lg border-solid border-gray-500 p-6 h-64 aspect-[3/2] bg-cover bg-center transition ease-in-out hover:-translate-y-2 hover:scale-105" style="background-image: url({thumbnail});" >
    <div class="grow flex flex-col justify-between bg-black bg-opacity-75 rounded-lg p-3">
        {@render children()}
        <div class="flex flex-row w-full justify-between">
            <div class="p-1">
                <p class="text-gray-200">{record.uri.timestamp.toLocaleDateString()}</p>
                <p class="text-gray-200">{record.uri.timestamp.toLocaleTimeString()}</p>
            </div>
            {#if live}
                <div class="flex flex-row p-[0.33rem] self-end bg-red-500 rounded-lg">
                    <i class="bi bi-record-fill text-neutral-50"></i>
                    <b class="text-neutral-50">Live</b>
                </div>
            {:else}
                <div class="self-end p-1">
                    <p class="text-gray-200">{duration}</p>
                </div>
            {/if}
        </div>
    </div>
</div>