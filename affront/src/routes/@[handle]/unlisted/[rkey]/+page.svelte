<script lang="ts">
    import { ATPUser } from "$lib/ATPUser";
    import Header from "$lib/components/Header.svelte";
    import Player from "$lib/components/Player.svelte";

    let { data } = $props();
    const user = data.diddoc ? ATPUser.fromDIDDoc(data.diddoc) : undefined
</script>

<Header {user}/>
<div class="mx-auto px-8 max-w-screen-2xl">
    <Player repo={data.focus.did} rkey={data.rkey} />
</div>