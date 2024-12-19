<script lang="ts">
    import { enhance } from '$app/forms';;
    import { PUBLIC_SPRINKLER_URL } from '$env/static/public';
    import type { ATPUser } from '$lib/ATPUser';
    import { ATURI } from '$lib/ATURI';
    import type { BanView, ChatView } from '$lib/lexicons/types/live/grayhaze/interaction/defs';
    import { decode, decodeFirst } from '@atcute/cbor';
    import { onMount } from 'svelte';
    let { rkey, authed, user, owner }: {rkey: string, authed: boolean, user: ATPUser, owner: boolean} = $props();
    const wsurl = `${PUBLIC_SPRINKLER_URL}/xrpc/live.grayhaze.interaction.subscribeChat?stream=${rkey}&did=${user.did}`

    const testchat = {
        src: {
            "text": "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
            "$type": "live.grayhaze.interaction.chat",
            "stream": {
                "cid": "bafyreih6th7mhszduwp3kmoyza26nle6x5eq7wdtv7jt5nilrvtq22utr4",
                "uri": "at://did:web:hugeblank.dev/live.grayhaze.content.stream/3ld6chveh2s2w"
            }
        },
        src_uri: "at://did:web:hugeblank.dev/live.grayhaze.interaction.chat/3ldhjrgpxhk2w",
        author: {
            did: "did:web:hugeblank.dev",
            handle: "hugeblank.dev"
        }
    }

    let chats: ChatView[] = $state([testchat, testchat, testchat, testchat, testchat, testchat, testchat, testchat, testchat, testchat, testchat, testchat ])

    function makesocket(box?: HTMLElement) {
        let ws = new WebSocket(wsurl)
        let opened = false
        ws.onopen = () => {
            console.log("chat socket: subscription")
            opened = true
        }
        ws.onclose = () => {
            console.log("chat socket: closed")
            if (opened) makesocket(box)
        }
        ws.onerror = () => {
            console.log("chat socket: errored")
        }
        ws.onmessage = async (e: MessageEvent<Blob>) => {
            if (chats.length === 1000) {
                chats.shift()
            }
            console.log(await e.data.text())
            // buffer -> uint array because linting is stupid and I can't be bothered to see red squiggles under e.data.bytes()
            const [ header, data ] = decodeFirst(new Uint8Array(await e.data.arrayBuffer()))
            if (header['op'] === 1) {
                const view: { src_uri: string } = decode(data as Uint8Array)
                const uri = new ATURI(view.src_uri)
                if (uri.collection === "live.grayhaze.interaction.chat") {
                    let scroll = false
                    if (box) scroll = box.scrollTop === 0
                    chats.push(view as ChatView)
                    if (box && scroll) box.scrollTo(0, 0)
                } else if (uri.collection === "live.grayhaze.interaction.ban") {
                    // Clear chats from a user that is banned
                    chats = chats.filter((chatview) => chatview.author.did !== (view as BanView).src.subject)
                } else {
                    console.warn(`Unknown view message ${uri}`)
                }
            }
        }
        return ws
    }

    
    
    onMount(() => {
        const box = document.getElementById("chatbox")
        makesocket(box || undefined)
    })

</script>

<div class="lg:min-w-96 lg:w-96 md:min-w-full md:w-full border-neutral-500 border">
    <div class="h-full flex flex-col">
        <div id="chatbox" class="grow h-64 flex flex-col-reverse overflow-auto overscroll-contain">
            <div class="px-2 ">
            {#each chats as chat}
                <!-- TODO: Usercard on click -->
                <div class="flex flex-row">
                    {#if owner}
                        <div class="pr-2">
                            <form method="POST" enctype="multipart/form-data" action="?/ban" use:enhance>
                                <input type="hidden" name="did" id="did" value="{chat.author.did}">
                                <button class="text-red-500 hover:underline" id="ban" name="ban" title="Chat" placeholder="Say something...">Ban</button>
                            </form>
                        </div>
                    {/if}
                    <div class="min-w-0 text-wrap break-words line-clamp-6">
                        <p class="">&lt;<a href="/{chat.author.did}"><b>{chat.author.displayName ?? chat.author.handle ? `@${chat.author.handle}` : chat.author.did}</b></a>&gt; {chat.src.text}</p>
                    </div>
                </div>
            {/each}
            </div>
        </div>
        {#if authed}
            <div class="place-content-end border-t border-neutral-500">
                <form method="POST" enctype="multipart/form-data" action="/api/action?/chat" use:enhance>
                    <input type="hidden" name="did" id="did" value="{user.did}">
                    <input type="hidden" name="rkey" id="rkey" value="{rkey}">
                    <input class="w-full bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" type="text" id="chat" name="chat" title="Chat" placeholder="Say something..."/>
                </form>
            </div>
        {/if}
    </div>
</div>