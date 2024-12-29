<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ATPUser } from "$lib/ATPUser";
    import type { Record } from "$lib/lexicons/types/live/grayhaze/actor/channel";
    import { BiStateHandler, type Image } from "$lib/StateHandler.svelte";
    import type { WrappedRecord } from "$lib/WrappedRecord";
    import { BlobRef } from "@atproto/lexicon";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { onMount } from "svelte";

    interface ChannelLike {
        avatar: BiStateHandler<Image>,
        banner: BiStateHandler<Image>,
        displayName: BiStateHandler<string>,
        description: BiStateHandler<string>
    }

    const { wrapped, focus, self = false }: { self?: boolean, wrapped: WrappedRecord<Record>, focus: ATPUser} = $props()
    const validator: ChannelLike = $state({
        avatar: new BiStateHandler(wrapped.value.avatar),
        banner: new BiStateHandler(wrapped.value.banner),
        displayName: new BiStateHandler(wrapped.value.displayName),
        description: new BiStateHandler(wrapped.value.description)
    })

    let channel = $state(wrapped.value)
    let edit = $state(false)
    let save = $derived(validator.avatar.changed || validator.banner.changed || validator.description.changed || validator.displayName.changed)
    let editable = $derived(edit && self)
    let avatarHover = $state(false)
    let descHeight = $state(0)
    
    function reset() {
        if (validator.avatar.changed) validator.avatar.clear()
        if (validator.banner.changed) validator.banner.clear()
        if (validator.displayName.changed) validator.displayName.clear()
        if (validator.description.changed) validator.description.clear()
    }

    function extractImage(image: Image | undefined) {
        if (!image) return ""
        if (image instanceof BlobRef) {
            return `/api/blob/image/${wrapped.uri.repo}/${image.ref}`
        } else if (image instanceof ArrayBuffer) {
            return URL.createObjectURL(new Blob([image]))
        } else {
            return image
        }
    }

    function setDisplayName(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        // Technically newlines shouldn't be allowed in the username field, but hey, let's support them.
        validator.displayName.value = e.currentTarget.value.length > 0 ? e.currentTarget.value.replace(/([^\r])?\n/g, "$1\r\n") : undefined
    }

    function setDescription(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) {
        // Carriage return added by PDS? Maybe?
        // As a result, to make sure the strings match if they're unchanged, we add them in.
        e.currentTarget.style.height = "auto"
        e.currentTarget.style.height = (e.currentTarget.scrollHeight + 1) + "px"
        validator.description.value = e.currentTarget.value.length > 0 ? e.currentTarget.value.replace(/([^\r])?\n/g, "$1\r\n") : undefined
    }

    async function onMediaChange(e: Event & { currentTarget: EventTarget & HTMLInputElement; }): Promise<string | ArrayBuffer | undefined> {
        const files = e.currentTarget.files
        if (files && files[0]) {
            let reader = new FileReader();
            reader.readAsDataURL(files[0])
            return await new Promise((resolve) => {
                reader.onload = (pe: ProgressEvent<FileReader>) => {
                    if (pe.target && pe.target.result) resolve(pe.target.result)
                }
            })
        }
        return undefined
    }

    const refreshChannel: SubmitFunction = ({ formData }) => {
        let avatar: File | undefined = formData.get("avatar") as File
        if (avatar!.size === 0 && validator.avatar.changed && validator.avatar.value instanceof ArrayBuffer) {
            formData.set("avatar", new Blob([validator.avatar.value]))
        } else if (avatar!.size === 0) {
            formData.delete("avatar")
        }
        let banner: File | undefined = formData.get("banner") as File
        if (banner!.size === 0 && validator.banner.changed && validator.banner.value instanceof ArrayBuffer) {
            formData.set("banner", new Blob([validator.banner.value]))
        } else if (banner!.size === 0) {
            formData.delete("banner")
        }
        if (validator.displayName.value && validator.displayName.changed) formData.set("displayName", validator.displayName.value)
        if (validator.description.value && validator.description.changed) formData.set("description", validator.description.value)

        return async ({ result }) => {
            if (result.type === "success") {
                edit = false
                channel = result.data as Record
                if (channel.avatar) validator.avatar = new BiStateHandler(channel.avatar)
                if (channel.banner) validator.banner = new BiStateHandler(channel.banner)
                if (channel.displayName) validator.displayName = new BiStateHandler(channel.displayName)
                if (channel.description) validator.description = new BiStateHandler(channel.description)
            }
        }
    }

    const fromBluesky: SubmitFunction = () => {
        return async ({ result }) => {
            if (result.type === "success" && result.data) {
                const data = result.data
                if (data.avatar) validator.avatar.value = data.avatar
                if (data.banner) validator.banner.value = data.banner
                if (data.displayName) validator.displayName.value = data.displayName
                if (data.description) validator.description.value = data.description
            }
        }
    }

    onMount(() => {
        const description = document.getElementById("description")
        if (description) descHeight = description.getClientRects()[0].height
    })
</script>


<!-- TODO: figure out why min-w-96 won't work here. -->
<div class="w-80 m-8 md:m-8 md:w-auto p-4 bg-local border-gray-500 rounded-lg my-2" style="background-image: url({extractImage(validator.banner.value)}); background-size: cover; background-position: center;">
    <div class="flex flex-col md:flex-row m-2 p-3 bg-black bg-opacity-80 rounded-lg">
        <div class="flex flex-col items-start justify-center max-w-96">
            <div class="flex items-center">
                <div class="size-16 shrink-0 rounded-full overflow-hidden m-2" style="background-image: url({ validator.avatar.value ? extractImage(validator.avatar.value) : "/nanashi.png" }); background-size: cover; background-position: center;">
                    {#if editable}
                        <label for="upload-avatar" class="size-16">
                            <button onmouseenter={() => avatarHover = !avatarHover} onmouseleave={() => avatarHover = !avatarHover} onclick={() => document.getElementById(`upload-avatar`)?.click()} class="size-full hover:bg-black hover:bg-opacity-80" aria-label="Change Channel Icon" title="Change Channel Icon">
                                <i class="text-2xl {avatarHover ? "bi bi-plus-lg" : ""}"></i>
                            </button>
                        </label>
                    {/if}
                </div>
                <div class="flex flex-col w-fit">
                    {#if editable}
                        <input value={validator.displayName.value} onfocusout={setDisplayName} oninput={setDisplayName} type="text" title="Display Name" placeholder="Display Name" class="w-full rounded-lg bg-transparent p-1 placeholder:text-gray-500 focus:shadow-none focus:ring-transparent"/>
                    {:else}
                        <h5 class="content-around line-clamp-1 shrink-0">{validator.displayName.value}</h5>
                    {/if}
                    {#if focus.handle}
                        <h6 class="content-around text-gray-400">@{focus.handle}</h6>
                    {:else}
                        <h6 class="content-around text-gray-400">{focus.did}</h6>
                    {/if}
                    {#if self}
                        <h6><a class="hover:underline text-red-500" href="/logout" data-sveltekit-reload>Log out</a></h6>
                    {/if}
                </div>
            </div>
            <div class="flex flex-row w-full mt-1">
                {#if editable}
                    <form method="POST" enctype="multipart/form-data" action="/api/action?/profile" class="h-10 m-2 w-1/3" use:enhance={refreshChannel}>
                        <input onchange={async (e) => validator.avatar.value = await onMediaChange(e) } id="upload-avatar" name="avatar" type="file" hidden accept="image/png,image/jpeg"/>
                        <input onchange={async (e) => validator.banner.value = await onMediaChange(e) } id="upload-banner" name="banner" type="file" hidden accept="image/png,image/jpeg"/>
                        {#if save}
                            <button type="submit" class="size-full p-3 rounded-lg bg-blue-500 hover:bg-blue-700 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Save Channel Details" aria-label="Save Channel Details">
                                <i class="text-inherit bi bi-floppy2-fill"></i>
                            </button>
                        {:else}
                            <button onclick={() => { edit = !edit; reset() } } class="size-full rounded-lg bg-neutral-500 hover:bg-neutral-700 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Close" aria-label="Close">
                                <i class="text-inherit bi bi-x-lg"></i>
                            </button>
                        {/if}
                    </form>
                    <label for="upload-banner" class="h-10 m-2 w-1/3">
                        <button onclick={() => document.getElementById(`upload-banner`)?.click()} class="size-full p-3 rounded-lg bg-green-600 hover:bg-green-800 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Upload Banner" aria-label="Upload Banner">
                            <i class="text-inherit bi bi-plus-lg"></i>&nbsp;<i class="text-inherit bi bi-image"></i>
                        </button>
                    </label>
                    <form method="POST" enctype="multipart/form-data" action="/api/action?/frombsky" class="h-10 m-2 w-1/3" use:enhance={fromBluesky}>
                        <button type="submit" class="size-full p-3 rounded-lg bg-blue-500 hover:bg-blue-700 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Import from BlueSky" aria-label="Import from BlueSky">
                            <i class="text-inherit bi bi-download"></i>&nbsp;<i class="text-inherit bi bi-moon-stars"></i>
                        </button>
                    </form>
                {:else if self && !edit}
                    <button onclick={() => edit = !edit} class="h-10 m-2 p-3 w-1/3 rounded-lg bg-green-600 hover:bg-green-800 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Edit Channel" aria-label="Edit Channel">
                        <i class="text-inherit bi bi-pencil"></i>
                    </button>
                {/if}
            </div>
        </div>
        <div class="p-3 content-stretch items-start w-full h-fit grow flex">
            {#if editable}
                <textarea value={validator.description.value} onfocusout={setDescription} oninput={setDescription} title="Description" placeholder="Description" class="w-full resize-none self-start bg-transparent border rounded-lg p-1 placeholder:text-gray-500 focus:shadow-none focus:ring-transparent" style="height: {descHeight}px;"></textarea>
            {:else}
                <p id="description" class="p-1 line-clamp-[15] break-words text-wrap border border-transparent whitespace-pre text-ellipsis overflow-hidden">{validator.description.value}</p>
            {/if}
        </div>
    </div>
</div>