<script lang="ts">
    import Link from "$lib/components/Link.svelte";

    let { data } = $props();
    const rkeys = data.records.map((record) => {
        const split = record.uri.split("/")
        return split[split.length-1]
    })
</script>

<div>
    <h2>@{data.user.getHandle()}</h2>
    {#each rkeys as rkey}
        <p>
            <Link to="/@{data.user.getHandle()}/{rkey}">{rkey}</Link>
        </p>
    {/each}
</div>