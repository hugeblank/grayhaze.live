<script lang="ts" generics="T">
    import type { WrappedRecord } from '$lib/WrappedRecord';
    import type { Snippet } from 'svelte';

    const { record, duration, thumbnail, live, children }: { record: WrappedRecord<T>, duration: string, thumbnail: string | ArrayBuffer | undefined, live: boolean , children: Snippet<[]> } = $props()
</script>

<div class="flex flex-col justify-end border rounded-lg border-solid border-gray-500 p-6 h-64 aspect-[3/2] bg-cover bg-center transition ease-in-out hover:-translate-y-2 hover:scale-105" style="background-image: url({thumbnail});" >
    <div class="grow flex flex-col p-3 bg-black bg-opacity-60 rounded-lg justify-between">
        {@render children()}
        <div class="flex flex-row w-full justify-between">
            <div>
                <p class="text-gray-200">{record.uri.timestamp.toLocaleDateString()}</p>
                <p class="text-gray-200">{record.uri.timestamp.toLocaleTimeString()}</p>
            </div>
            {#if live}
                <div class="place-content-end flex flex-row self-end p-1 h-fit place-items-end bg-red-500 rounded-lg">
                    <i class="bi bi-record-fill text-neutral-50"></i>
                    <b class="text-neutral-50">Live</b>
                </div>
            {:else}
                <p class="text-gray-200 place-content-end">{duration}</p>
            {/if}
        </div>
    </div>
</div>