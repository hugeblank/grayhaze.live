<script lang="ts" generics="T">
    import type { WrappedRecord } from '$lib/WrappedRecord';
    import { onMount, type Snippet } from 'svelte';

    const { record, duration, thumbnail, live, progress, children }: { record: WrappedRecord<T>, duration: number, thumbnail: string | ArrayBuffer | undefined, live: boolean, progress?: string, children: Snippet<[]> } = $props()

    let dnum = Math.floor(duration+0.5)
    let dchunks = []
    // TODO: Correctly display over 24 hours
    for (let i = 0; i < 3; i++) {
        let val = Math.floor(dnum % 60)
        dchunks.push(":" + ((val < 10) ? "0" + val : val))
        dnum /= 60
    }
    let sub = 1
    if (dchunks[2] === ":00") dchunks.pop()
    if (dchunks.length > 1 && dchunks[dchunks.length-1].startsWith(":0")) sub +=1
    const dstr = dchunks.reverse().join("").substring(sub)

    let watched = $state(0)

    onMount(() => {
        if (progress) watched = Math.floor((Number(sessionStorage.getItem(record.uri.repo + ":" + progress) ?? 0)/duration)*100)
    })
</script>

<div class="flex flex-col justify-end border rounded-lg border-solid border-gray-500 p-6 h-64 aspect-[3/2] bg-cover bg-center transition ease-in-out hover:-translate-y-2 hover:scale-105" style="background-image: url({thumbnail});" >
    <div class="grow flex flex-col bg-black bg-opacity-75 rounded-lg overflow-hidden">
        <div class="grow flex flex-col justify-between p-3">
            {@render children()}
            <div class="flex flex-row w-full justify-between">
                <div>
                    <p class="text-gray-200">{record.uri.timestamp.toLocaleDateString()}</p>
                    <p class="text-gray-200">{record.uri.timestamp.toLocaleTimeString()}</p>
                </div>
                {#if live}
                    <div class="flex flex-row self-end bg-red-500 rounded-lg">
                        <i class="bi bi-record-fill text-neutral-50"></i>
                        <b class="text-neutral-50">Live</b>
                    </div>
                {:else}
                    <div class="self-end pt-1">
                        <p class="text-gray-200">{dstr}</p>
                    </div>
                {/if}
            </div>
        </div>
        {#if progress}
            <div class="h-1 bg-blue-500" style="width: {watched}%;"></div>
        {/if}
    </div>
</div>