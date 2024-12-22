<script lang="ts">
    import type { ATPUser } from "$lib/ATPUser";
    import type { Record } from "$lib/lexicons/types/live/grayhaze/actor/channel";
    import type { WrappedRecord } from "$lib/WrappedRecord";

    const { wrapped, focus, self = false }: { self?: boolean, wrapped: WrappedRecord<Record>, focus: ATPUser} = $props()
    const channel = wrapped.value
</script>

<div class="p-4 bg-local relative border-gray-500 border-[1px] rounded-[1em] m-2" style="background-image: url({channel.banner}); background-size: cover; background-position: center;">
        <div class="flex flex-wrap m-2 p-3 bg-black bg-opacity-80 rounded-md">
            <div class="flex flex-col items-center justify-center">
                <div class="flex items-center">
                    {#if channel.avatar}
                        <img src="/api/blob/image?did={wrapped.uri.repo}&cid={channel.avatar.ref}" alt="Bluesky avatar" class="rounded-full w-16 h-16 m-2"/>
                    {:else}
                        <div class="rounded-full w-16 h-16 m-2 bg-gradient-to-b from-gray-600 to-gray-500 flex items-center justify-center"><i class="bi bi-camera"></i></div>
                    {/if}
                    <div class="object-contain p-3">
                        {#if channel.displayName}
                            <h4 class="content-around">{channel.displayName}</h4>
                        {:else}
                            <div class="h-5 w-36 rounded-lg bg-gradient-to-b from-gray-600 to-gray-500"></div>
                        {/if}
                        {#if focus.handle}
                        <h6 class="content-around">@{focus.handle} {#if self} <a class="hover:underline hover:text-red-500" href="/logout" data-sveltekit-reload>Log out</a>{/if}</h6>
                        {/if}
                    </div>
                </div>
                <div class="h-10 w-full rounded-lg bg-green-700 hover:bg-green-900 flex items-center justify-center">
                    <p>Upload Banner</p>
                    <!-- TODO: Button -->
                </div>
            </div>
            <div class="p-3 content-stretch w-fit grow min-w-100">
                {#if channel.description}
                    <p>{channel.description}</p>
                {:else}
                    <div class="h-36 w-full rounded-lg bg-gradient-to-b from-gray-600 to-gray-500"></div>
                {/if}
            </div>
        </div>
</div>