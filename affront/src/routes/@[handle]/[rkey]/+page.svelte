<script lang="ts">
    import { ATPUser } from "$lib/ATPUser";
    import Chat from "$lib/components/Chat.svelte";
    import Header from "$lib/components/Header.svelte";
    import Player from "$lib/components/Player.svelte";

    let { data } = $props();
    const user = data.diddoc ? ATPUser.fromDIDDoc(data.diddoc) : undefined
</script>
<div class="mx-auto">
    <Header {user}/>
    <div class="flex lg:flex-row flex-col">
        <Player repo={data.focus.did} rkey={data.formatrkey} />
        <Chat authed={data.diddoc !== undefined} rkey={data.streamrkey} focus={data.focus} {user}/>
    </div>
    {#if data.title}
        <h3 class="py-2">{data.title}</h3>
    {/if}
    {#if data.tags}
        <p>{data.tags.join(", ")}</p>
    {/if}
</div>