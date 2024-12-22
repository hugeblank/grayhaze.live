<script lang="ts">
    import Grid from "$lib/components/Grid.svelte";
    import { SvelteMap } from "svelte/reactivity";
    import RecordForm from "$lib/components/RecordForm.svelte";
    import ContentCard from "$lib/components/ContentCard.svelte";
    import { WrappedRecord } from "$lib/WrappedRecord.js";
    import type { Record as HlsRecord } from "$lib/lexicons/types/live/grayhaze/format/hls.js";
    import Header from "$lib/components/Header.svelte";
    import { ATPUser } from "$lib/ATPUser.js";
    
    let { data } = $props();

    function getDuration(record: WrappedRecord<HlsRecord>) {
        let dnum = 0
        record.value.sequence.forEach((seg) => {
            dnum += seg.duration/1000000
        })
        dnum = Math.floor(dnum+0.5)
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
        return dchunks.reverse().join("").substring(sub)
    }

    const mappedRawMedia = data.rawMedia?.map((record) => {
        return {
            record,
            live: !record.value.end,
            to: `/@${data.focus.handle}/unlisted/${record.uri.rkey}`,
            duration: getDuration(record),
            thumbnail: undefined,
            id: record.uri.toString()
        }
    })

    const mappedStreams = data.publishedStreams?.map(({ streamrecord, hlsrecord }) => {
        // TODO: Support more than hls record format
        return {
            record: streamrecord,
            live: !hlsrecord.value.end,
            to: `/@${data.focus.handle}/${streamrecord.uri.rkey}`,
            duration: getDuration(hlsrecord),
            thumbnail: `/api/blob/image/${data.focus.did}/${streamrecord.value.thumbnail?.image.ref.toString()}`,
            id: streamrecord.uri.toString()
        }
    })

    let localSrc: Map<string, ArrayBuffer | string | undefined> = $state(new SvelteMap())
    function onchange(e: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
        const files = e.currentTarget.files
        if (files && files[0]) {
            const id = e.currentTarget.id.replace("upload-image-", "")
            var reader = new FileReader();
            reader.readAsDataURL(files[0])
            reader.onload = (pe: ProgressEvent<FileReader>) => {
                if (pe.target && pe.target.result) localSrc.set(id, pe.target.result)
            }
        }
    }
    const user = data.diddoc ? ATPUser.fromDIDDoc(data.diddoc) : undefined
</script>

<Header {user}/>
<div class="mx-auto max-w-screen-2xl h-[90vh]">
    <div class="flex flex-row justify-between">
        <h3 class="my-1">@{data.focus.handle}</h3>
        {#if data.self}
            <a class="hover:underline" href="/logout" data-sveltekit-reload><h3 class="my-1">Sign out</h3></a>
        {/if}
    </div>
    {#if data.self && mappedRawMedia && mappedRawMedia.length > 0}
        <h4 class="my-1">Unlisted Content</h4>
        <Grid items={mappedRawMedia}>
            {#snippet renderer({ record, to, duration, live })}
                <RecordForm name="publish" {record}>
                    <ContentCard thumbnail={localSrc.get(record.uri.rkey)} {record} {duration} {live}>
                        <!-- Title -->
                        <div class="flex w-full h-fit items-center pb-1">
                            <input class="w-full px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" id="title" type="text" name="title" placeholder="Title" title="Stream Title"/>
                        </div>
                        <div class="flex w-full h-fit items-center">
                            <input class="w-full h-8 text-sm px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" id="tags" type="text" name="tags" placeholder="Tags" title="Stream Tags"/>
                        </div>
                        <div class="flex w-full flex-row justify-between mt-1">
                            <!-- Open Stream -->
                            <a href={to} target="_blank" class="self-start bg-neutral-500 hover:bg-neutral-700 text-neutral-100 hover:text-neutral-300 font-bold py-1 px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="button" title="View Content" aria-label="View Content">
                                <i class="align-middle pt-1 text-inherit bi bi-film"></i> <i class="align-middle pt-1 text-inherit bi bi-box-arrow-up-right"></i>
                            </a>
                            <!-- Upload Image -->
                            <input {onchange} id="upload-image-{record.uri.rkey}" name="thumbnail" type="file" hidden accept="image/png,image/jpeg"/>
                            <label for="upload-image-{record.uri.rkey}">
                                <button onclick={() => document.getElementById(`upload-image-${record.uri.rkey}`)?.click()} class="bg-green-600 hover:bg-green-800 text-neutral-100 hover:text-neutral-500 font-bold py-1 px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="button" aria-label="Upload Thumbnail" title="Upload Thumbnail">
                                    <i class="text-inherit bi bi-image"></i> <i class="text-inherit bi bi-plus-lg"></i>
                                </button>
                            </label>
                            <!-- Publish Stream -->
                            <button class="bg-blue-500 hover:bg-blue-700 text-neutral-100 hover:text-neutral-300 font-bold py-1 px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="submit" aria-label="Publish" title="Publish">
                                <i class="text-inherit bi bi-camera-reels"></i> <i class="text-inherit bi bi-upload"></i>
                            </button>
                        </div>
                    </ContentCard>
                </RecordForm>
            {/snippet}
        </Grid>
    {/if}
    <h4 class="my-1">Streams</h4>
    <Grid items={mappedStreams}>
        {#snippet renderer({ record, to, duration, thumbnail, live })}
            <a class="w-fit" href={to}>
                <ContentCard {thumbnail} {record} {duration} {live}>
                    <!-- Title -->
                    <div class="flex w-full place-content-start line-clamp-2">
                        <b>{record.value.title}</b>
                    </div>
                    <div class="flex w-full text-sm line-clamp-2">
                        {record.value.tags?.join(", ")}
                    </div>
                </ContentCard>
            </a>
        {/snippet}
    </Grid>
    
</div>
