<script>
    import { ATPUser } from "$lib/ATPUser";
    import Header from "$lib/components/Header.svelte";

    const { data } = $props()
    const user = data.diddoc ? ATPUser.fromDIDDoc(data.diddoc) : undefined
</script>

<Header {user}/>
<div class="mx-auto max-w-screen-2xl h-[90vh]">
    <div>
        <b><i>Enjoy a video.</i></b>
        <p>Welcome to GrayHaze, right now we're in very early alpha, as you can pretty clearly see. This page will eventually be populated with all the really cool creators that want to stream on the ATmosphere.</p>
        <p>In the mean time, if you're looking for development and progress streams, you're probably looking for <a class="text-blue-500 hover:underline" href="/@hugeblank.dev">@hugeblank.dev</a>, in which case I've handily linked him for you!</p>
        <p>If not that, then maybe you're wondering <a class="text-blue-500 hover:underline" href="/about">what is GrayHaze?</a></p>
    </div>
</div>