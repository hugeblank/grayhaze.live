<script lang="ts">
    let { data } = $props();
</script>

<div>
    <h1>GrayHaze</h1>
    <h2>@{data.user.getHandle()}</h2>
    {#each data.hlsrecords as rkey}
        <p><a href="/@{data.user.getHandle().replace("at://", "")}/{rkey}">{rkey}</a></p>
    {/each}
</div>