<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ATPUser } from "$lib/ATPUser";
    import type { Record } from "$lib/lexicons/types/live/grayhaze/actor/channel";
    import type { WrappedRecord } from "$lib/WrappedRecord";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { onMount } from "svelte";

    interface ChannelLike {
        displayName?: string,
        avatar?: ArrayBuffer | string, // Not files but we'll worry about it later
        banner?: ArrayBuffer | string,
        description?: string
    }

    const { wrapped, focus, self = false }: { self?: boolean, wrapped: WrappedRecord<Record>, focus: ATPUser} = $props()
    let channel = $state(wrapped.value)
    const validator: ChannelLike = $state({})
    
    function reset() {
        validator.avatar = undefined
        validator.banner = undefined
        validator.displayName = channel.displayName
        validator.description = channel.description
    }

    function setDisplayName(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        validator.displayName = e.currentTarget.value.length > 0 ? e.currentTarget.value : undefined
    }

    function setDescription(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) {
        validator.description = e.currentTarget.value.length > 0 ? e.currentTarget.value : undefined
    }

    async function onMediaChange(e: Event & { currentTarget: EventTarget & HTMLInputElement; }): Promise<string | ArrayBuffer | undefined> {
        const files = e.currentTarget.files
        if (files && files[0]) {
            var reader = new FileReader();
            reader.readAsDataURL(files[0])
            return await new Promise((resolve) => {
                reader.onload = (pe: ProgressEvent<FileReader>) => {
                    if (pe.target && pe.target.result) resolve(pe.target.result)
                }
            })
        }
        return undefined
    }

    let edit = $state(false)
    let save = $derived(channel.description !== validator.description || channel.displayName !== validator.displayName || validator.avatar || validator.banner)
    let editable = $derived(edit && self)
    let avatarHover = $state(false)

    onMount(() => {
        validator.displayName = channel.displayName
        validator.description = channel.description
        console.log(channel.description !== validator.description, channel.displayName !== validator.displayName, validator.avatar, validator.banner)
    })

    const refreshChannel: SubmitFunction = ({ formData }) => {
        let avatar: File | undefined = formData.get("avatar") as File
        if (avatar!.size === 0) formData.delete("avatar")
        let banner: File | undefined = formData.get("banner") as File
        if (banner!.size === 0) formData.delete("banner")
        if (validator.displayName && validator.displayName !== channel.displayName) formData.set("displayName", validator.displayName)
        if (validator.description && validator.description !== channel.description) formData.set("description", validator.description)

        return async ({ result, update }) => {
            if (result.type === "success") {
                edit = false
                channel = result.data as Record
                reset()
            }
        }
    }
</script>

<div class="p-4 bg-local relative border-gray-500 border-[1px] rounded-[1em] m-2" style="background-image: url({validator.banner ?? (channel.banner ? `/api/blob/image/${wrapped.uri.repo}/${channel.banner.ref}` : "")}); background-size: cover; background-position: center;">
    <div class="flex flex-col lg:flex-row m-2 p-3 bg-black bg-opacity-80 rounded-lg">
        <div class="flex flex-row lg:flex-col items-start justify-center min-w-96">
            <div class="flex items-center w-fit">
                <div class="h-16 w-16 rounded-full overflow-hidden m-2 flex flex-grow items-center justify-center" style="background-image: url({ validator.avatar ?? (channel.avatar ? `/api/blob/image/${wrapped.uri.repo}/${channel.avatar.ref}` : "/nanashi.png") }); background-size: cover; background-position: center;">
                    {#if editable}
                        <label for="upload-avatar" class="w-full h-full">
                            <button onmouseenter={() => avatarHover = !avatarHover} onmouseleave={() => avatarHover = !avatarHover} onclick={() => document.getElementById(`upload-avatar`)?.click()} class="w-full h-full hover:bg-black hover:bg-opacity-80" aria-label="Change Channel Icon" title="Change Channel Icon">
                                <i class="text-2xl {avatarHover ? "bi bi-plus-lg" : ""}"></i>
                            </button>
                        </label>
                    {/if}
                </div>
                <div class="w-72">
                    {#if editable}
                        <input value={validator.displayName} onfocusout={setDisplayName} oninput={setDisplayName} type="text" title="Display Name" placeholder="Display Name" class="w-full rounded-lg bg-transparent p-1 placeholder:text-gray-500 focus:shadow-none focus:ring-transparent"/>
                    {:else}
                        <h5 class="content-around">{channel.displayName}</h5>
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
            <div class="flex flex-col lg:flex-row w-full mt-1">
                {#if editable}
                    <form method="POST" enctype="multipart/form-data" action="/api/action?/profile" class="h-10 m-2 w-24 lg:w-1/3" use:enhance={refreshChannel}>
                        <input onchange={async (e) => validator.avatar = await onMediaChange(e) } id="upload-avatar" name="avatar" type="file" hidden accept="image/png,image/jpeg"/>
                        <input onchange={async (e) => validator.banner = await onMediaChange(e) } id="upload-banner" name="banner" type="file" hidden accept="image/png,image/jpeg"/>
                        {#if save}
                            <button type="submit" class="w-full h-full p-3 rounded-lg bg-blue-500 hover:bg-blue-700 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Save Channel Details" aria-label="Save Channel Details">
                                <i class="text-inherit bi bi-floppy2-fill"></i>
                            </button>
                        {:else}
                            <button onclick={() => { edit = !edit; reset() } } class="w-full h-full rounded-lg bg-neutral-500 hover:bg-neutral-700 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Close" aria-label="Close">
                                <i class="text-inherit bi bi-x-lg"></i>
                            </button>
                        {/if}
                    </form>
                    <label for="upload-banner" class="h-10 m-2 w-24 lg:w-1/3">
                        <button onclick={() => document.getElementById(`upload-banner`)?.click()} class="w-full h-full p-3 rounded-lg bg-green-600 hover:bg-green-800 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Upload Banner" aria-label="Upload Banner">
                            <i class="text-inherit bi bi-plus-lg"></i>&nbsp;<i class="text-inherit bi bi-image"></i>
                        </button>
                    </label>
                    <button class="h-10 m-2 p-3 w-24 lg:w-1/3 rounded-lg bg-blue-500 hover:bg-blue-700 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Import from BlueSky" aria-label="Import from BlueSky">
                        <i class="text-inherit bi bi-download"></i>&nbsp;<i class="text-inherit bi bi-moon-stars"></i>
                    </button>
                {:else if self && !edit}
                    <button onclick={() => edit = !edit} class="h-10 m-2 p-3 w-24 lg:w-1/3 rounded-lg bg-green-600 hover:bg-green-800 text-neutral-100 hover:text-neutral-400 flex items-center justify-center" title="Edit Channel" aria-label="Edit Channel">
                        <i class="text-inherit bi bi-pencil"></i>
                    </button>
                {/if}
            </div>
        </div>
        <div class="p-3 content-stretch items-start w-full grow flex">
            {#if editable}
                <textarea value={validator.description ?? channel.description} onfocusout={setDescription} oninput={setDescription} title="Description" placeholder="Description" class="h-full resize-none self-start w-full bg-transparent border rounded-lg p-1 placeholder:text-gray-500 focus:shadow-none focus:ring-transparent"></textarea>
            {:else}
                <p>{channel.description}</p>
            {/if}
        </div>
    </div>
</div>