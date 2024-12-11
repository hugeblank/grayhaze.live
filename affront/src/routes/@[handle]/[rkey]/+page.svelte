<script lang="ts">
    import Player from "$lib/components/Player.svelte";

    let { data } = $props();
</script>

<Player repo={data.user.getDID()} rkey={data.rkey} />