<script lang="ts">
    import { ATPUser } from "$lib/ATPUser";
    import Chat from "$lib/components/Chat.svelte";
    import Header from "$lib/components/Header.svelte";
    import Player from "$lib/components/Player.svelte";

    let { data } = $props();

    let hidden = $state(false)
    let icon = $derived(hidden ? "text-inherit bi bi-plus-square" : "text-inherit bi bi-x-square")
    const popout = `/@${data.focus.handle}/${data.streamrkey}/chat/popout`

</script>
<div class="mx-auto">
    <Header user={data.user}/>
    <div class="flex lg:flex-row flex-col">
        <Player repo={data.focus.did} rkey={data.formatrkey} />
        {#if !hidden} <Chat rkey={data.streamrkey} focus={data.focus} user={data.user} userChannel={data.channel}/> {/if}
    </div>
    <div class="m-2 flex flex-row justify-between">
        {#if data.title}
            <h3>{data.title} - <a class="hover:underline text-blue-500" href="/@{data.focus.handle ? data.focus.handle : data.focus.did}">{data.focus.getName()}</a></h3>
        {/if}
        <div>
            <button onclick={() => { hidden = !hidden; window.open(popout, '_blank', 'popup=true') }} class=" bg-gray-500 hover:bg-gray-700 text-neutral-100 hover:text-neutral-300 font-bold px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="button" aria-label="Popout chat" title="Popout chat">
                <i class="text-inherit bi bi-chat-left-dots"></i> <i class="text-inherit bi bi-box-arrow-up-right"></i>
            </button>
            <button onclick={() => hidden = !hidden } class="bg-blue-500 hover:bg-blue-700 text-neutral-100 hover:text-neutral-300 font-bold px-4 h-10 rounded-lg focus:outline-none focus:shadow-outline" type="button" aria-label="Hide chat" title="Hide chat">
                <i class="text-inherit bi bi-chat-left-dots"></i> <i class={icon}></i>
            </button>
        </div>
    </div>
    <div class="m-2">
        {#if data.tags}
            <p>{data.tags.join(", ")}</p>
        {/if}
    </div>
</div>