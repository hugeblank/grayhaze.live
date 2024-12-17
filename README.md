# GrayHaze Live
"Enjoy a video"

Live streaming over ATProto

Please note that absolutely nothing in this repo is final and I'm only sharing everything here because I want to show off the work. Please take the lexicons and lack of documentation with a grain of salt.

## In this Repo

1. Lexicons
   - Base ATProto lexicons for GrayHaze
   - Cleanup script that adapts for affront (svelte), and sprinkler
2. Blobify
   - Watches for HLS playlists and their respective segments generally provided by OBS
   - Uploads segments as blobs, and creates/updates record on PDS
   - Check out [this forum post](https://obsproject.com/forum/resources/how-to-do-hls-streaming-in-obs-open-broadcast-studio.945/) for info on how to set up hls recording.
   - Recommended settings: 
     - Video Bitrate: 9000 Kbps
     - Keyframe Interval: 300
3. Affront
   - Middleman for HLS records, transforming them back into an m3u8 playlist file
   - TODO: Move transformer to XRPC subscription based method ^
   - Web Frontend
4. Sprinkler
   - XRPC server AppView
   - Handles chat streams, (should handle) account creation, moderation, etc.

### TODO
The following was done LIVE on GrayHaze with chat. [Check it out!](https://grayhaze.live/@hugeblank.dev/3ldi2vrnn6c2w)

- dedicated chat popout
- raw chat mode (with css ids)
- rich text facets
  - emotes 
  - moderation control over links
- moderation
  - OAuth style permission scopes
  - 
- user cards
  - on click in chat, users basic information pops up
    - followers, profile icon username, handle
    - chat history (maybe moderators only)
- light mode
- account settings
  - username, avatar, offline banner, description
  - username color
  - bluesky profile import
  - external account linking
- stream settings - title & thumbnail update
- Caching
  - audio slider sitewide
  - VOD watch time
- BETTER SERVERS - development grant :)
- Emotes
  1. User uploads emote, gets added to their channel
  2. Emote owner sends emote in another chat
  3. Another user sees emote and likes it. clicks on it to add it to their "inventory"
  - Badges on account page
    - Collector - 100 + emotes in inventory
    - Uploader - 50+ emotes uploaded