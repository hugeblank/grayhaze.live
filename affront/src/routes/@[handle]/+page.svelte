<script lang="ts">
    import Grid from "$lib/components/Grid.svelte";
    import { SvelteMap } from "svelte/reactivity";
    import RecordForm from "$lib/components/RecordForm.svelte";
    import ContentCard from "$lib/components/ContentCard.svelte";
    import Header from "$lib/components/Header.svelte";
    import { ATPUser } from "$lib/ATPUser.js";
    import ProfileCard from "$lib/components/ProfileCard.svelte";
    
    let { data } = $props();

    const mappedRawMedia = data.rawMedia

    const mappedStreams = data.publishedStreams

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
<div class="mx-auto max-w-screen-3xl h-[90vh]">
    <ProfileCard self={data.self} wrapped={data.channel} focus={data.focus}/>
    {#if data.self && mappedRawMedia && mappedRawMedia.length > 0}
        <h4 class="my-1 mx-8">Unlisted Content</h4>
        <Grid items={mappedRawMedia}>
            {#snippet renderer({ uri, cid, to, duration, live })}
                <RecordForm name="publish" {uri} {cid}>
                    <ContentCard thumbnail={localSrc.get(uri.rkey)} {uri} {duration} {live}>
                        <!-- Title -->
                        <div class="flex w-full h-fit items-center pb-1">
                            <input class="w-full px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" id="title" type="text" name="title" placeholder="Title" title="Stream Title"/>
                        </div>
                        <div class="flex w-full h-fit items-center">
                            <input class="w-full h-8 text-sm px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" id="tags" type="text" name="tags" placeholder="Tags" title="Stream Tags"/>
                        </div>
                        <div class="flex w-full flex-row justify-between mt-1">
                            <!-- Open Stream -->
                            <a href={ `/@${data.focus.handle}` + to } target="_blank" class="self-start bg-neutral-500 hover:bg-neutral-700 text-neutral-100 hover:text-neutral-400 font-bold py-1 px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="button" title="View Content" aria-label="View Content">
                                <i class="align-middle pt-1 text-inherit bi bi-film"></i> <i class="align-middle pt-1 text-inherit bi bi-box-arrow-up-right"></i>
                            </a>
                            <!-- Upload Image -->
                            <input {onchange} id="upload-image-{uri.rkey}" name="thumbnail" type="file" hidden accept="image/png,image/jpeg"/>
                            <label for="upload-image-{uri.rkey}">
                                <button onclick={() => document.getElementById(`upload-image-${uri.rkey}`)?.click()} class="bg-green-600 hover:bg-green-800 text-neutral-100 hover:text-neutral-400 font-bold py-1 px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="button" aria-label="Upload Thumbnail" title="Upload Thumbnail">
                                    <i class="text-inherit bi bi-image"></i> <i class="text-inherit bi bi-plus-lg"></i>
                                </button>
                            </label>
                            <!-- Publish Stream -->
                            <button class="bg-blue-500 hover:bg-blue-700 text-neutral-100 hover:text-neutral-400 font-bold py-1 px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="submit" aria-label="Publish" title="Publish">
                                <i class="text-inherit bi bi-camera-reels"></i> <i class="text-inherit bi bi-upload"></i>
                            </button>
                        </div>
                    </ContentCard>
                </RecordForm>
            {/snippet}
        </Grid>
    {/if}
    <h4 class="my-1 mx-8">Streams</h4>
    <Grid items={mappedStreams}>
        {#snippet renderer({ uri, to, duration, details, live })}
            <a class="w-fit" href={ `/@${data.focus.handle}` + to }>
                <ContentCard thumbnail={details.thumbnail} progress={details.progress} {uri} {duration} {live}>
                    <!-- Title -->
                    <div class="flex w-full place-content-start line-clamp-2">
                        <b>{details.title}</b>
                    </div>
                    <div class="flex w-full text-sm line-clamp-2">
                        {details.tags?.join(", ")}
                    </div>
                </ContentCard>
            </a>
        {/snippet}
    </Grid>
    
</div>
