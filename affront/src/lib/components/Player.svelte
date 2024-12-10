<script lang="ts">
    const { repo, rkey } = $props()
</script>

<div class="w-fit">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video class="w-fit" id="video" controls src="/adapt/{repo}/{rkey}"></video>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
    <script>
        var video = document.getElementById('video');
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
    </script>
</div>