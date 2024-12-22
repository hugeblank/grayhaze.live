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

            video.volume = Number(sessionStorage.getItem("volume") ?? 1)
            video.currentTime = Number(sessionStorage.getItem(`${repo}:${rkey}`))

            video.addEventListener("volumechange", () => {
                sessionStorage.setItem("volume", video.volume.toString())
            })

            video.addEventListener("timeupdate", () => {
                sessionStorage.setItem(`${repo}:${rkey}`, video.currentTime.toString())
            })
        }
    })
</script>

<div class="w-full">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video class="aspect-video max-h-screen" id="video" autoplay controls src="/api/adapt/{repo}/{rkey}"></video>
</div>