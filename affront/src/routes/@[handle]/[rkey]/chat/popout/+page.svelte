<script lang="ts">
    import { ATPUser } from "$lib/ATPUser.js";
    import Chat from "$lib/components/Chat.svelte";

    let { data } = $props();
    const user = data.diddoc ? ATPUser.fromDIDDoc(data.diddoc) : undefined
</script>
<Chat authed={data.diddoc !== undefined} rkey={data.streamrkey} focus={data.focus} {user} userChannel={data.channel} style="popout"/>