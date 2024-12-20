<script lang="ts">
    import Hls from "hls.js";
    import { onMount } from "svelte";

    const { repo, rkey } = $props()
    onMount(async () => {
        console.log("mount")
        if (typeof window !== undefined) {
            var video = document.getElementById('video')! as HTMLVideoElement;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                console.log("HLS very supported")
            } else if (Hls.isSupported()) {
                console.log("should work...")
                var hls = new Hls();
                hls.loadSource(video.src);
                hls.attachMedia(video);
                
            } else {
                console.error("Can't play hls playlist")
            }
        }
    })
</script>

<div class="w-full">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video class="aspect-video" id="video" autoplay controls src="/api/adapt/{repo}/{rkey}"></video>
</div>