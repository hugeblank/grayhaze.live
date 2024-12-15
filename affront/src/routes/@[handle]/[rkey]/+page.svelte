<script lang="ts">
    import Chat from "$lib/components/Chat.svelte";
    import Player from "$lib/components/Player.svelte";

    let { data } = $props();
</script>
<div class="flex lg:flex-row flex-col">
    <Player repo={data.user.did} rkey={data.formatrkey} />
    <Chat rkey={data.streamrkey}/>
</div>
{#if data.title}
    <h3 class="py-2">{data.title}</h3>
{/if}
{#if data.tags}
    <p>{data.tags.join(", ")}</p>
{/if}