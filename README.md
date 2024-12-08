# GrayHaze Live

Live streaming over ATProto

## Objectives

1. Lexicons
2. Blobify
   - RTMP server that chunks the stream from the client, and uploads blobs to users PDS
   - Isolated from the AppView to allow for other users to run their own Blobify instances
3. AppView
4. GrayHaze.live
   - Web Frontend 