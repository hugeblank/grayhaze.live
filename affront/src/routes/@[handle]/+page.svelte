<script lang="ts">
    import Grid from "$lib/components/streams/unlisted/Grid.svelte";
    import { parse } from "@atcute/tid"

    let { data } = $props();
    const handle = data.user.getHandle()
    const records = data.records.map((record) => {
        const split = record.uri.split("/")
        return {
            to: `/@${handle}/unlisted/${split[split.length-1]}`,
            rkey: split[split.length-1],
            timestamp: (new Date(parse(split[split.length-1]).timestamp/1000)).toLocaleString()
        }
    })

</script>

<div>
    <h3 class="my-1">@{handle}</h3>
    {#if data.self}
        <h4 class="my-1">Unlisted Content</h4>
        <Grid items={records}/>
    {/if}
</div>