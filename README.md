# GrayHaze Live

Live streaming over ATProto

Please note that absolutely nothing in this repo is final and I'm only sharing everything here because I want to show off the work. Please take the lexicons and lack of documentation with a grain of salt.

## In this Repo

1. Lexicons
2. Blobify
   - Watches for HLS playlists and their respective segments generally provided by OBS
   - Uploads segments as blobs, and creates/updates record on PDS
   - Check out [this forum post](https://obsproject.com/forum/resources/how-to-do-hls-streaming-in-obs-open-broadcast-studio.945/) for info on how to set up hls recording.
   - Recommended settings: 
     - Video Bitrate: 9000 Kbps
     - Keyframe Interval: 300
3. GrayHaze.live
   - Middleman for HLS records, transforming them back into an m3u8 playlist file
   - Web Frontend
4. Sprinkler
   - XRPC server 