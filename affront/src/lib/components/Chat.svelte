<script lang="ts">
    import { enhance } from '$app/forms';
    import { PUBLIC_SPRINKLER_URL } from '$env/static/public';
    import type { ATPUser } from '$lib/ATPUser';
    import { ATURI } from '$lib/ATURI';
    import type { BanView, ChatView } from '$lib/lexicons/types/live/grayhaze/interaction/defs';
    import { decode, decodeFirst } from '@atcute/cbor';
    import type { SubmitFunction } from '@sveltejs/kit';
    import { onMount } from 'svelte';
    import type { ChatActionResponse } from '../../routes/api/action/+page.server';
    import type { Record } from '$lib/lexicons/types/live/grayhaze/actor/channel';
    let { rkey, focus, user, userChannel, style = "standard" }: {rkey: string, focus: ATPUser, user?: ATPUser, userChannel?: Record, style?: "standard" | "popout" } = $props();
    const wsurl = `${PUBLIC_SPRINKLER_URL}/xrpc/live.grayhaze.interaction.subscribeChat?stream=${rkey}&did=${focus.did}`

    // const testchat = {
    //     src: {
    //         "text": "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    //         "$type": "live.grayhaze.interaction.chat",
    //         "stream": {
    //             "cid": "bafyreih6th7mhszduwp3kmoyza26nle6x5eq7wdtv7jt5nilrvtq22utr4",
    //             "uri": "at://did:web:hugeblank.dev/live.grayhaze.content.stream/3ld6chveh2s2w"
    //         }
    //     },
    //     src_uri: "at://did:web:hugeblank.dev/live.grayhaze.interaction.chat/3ldhjrgpxhk2w",
    //     author: {
    //         did: "did:web:hugeblank.dev",
    //         handle: "hugeblank.dev"
    //     }
    // }

    let chats: ChatView[] = $state([])
    
    const submitFunction: SubmitFunction = ({ formData }) => {
        console.log(userChannel?.displayName)
        const text = formData.get("chat")?.toString()
        if (text && user) {
            return async ({ result, update }) => {
                if (result.type === "success" && result.data) {
                    const data = result.data as ChatActionResponse
                    let avatar
                    if (userChannel?.avatar) {
                        avatar = `${user.pds}/xrpc/com.atproto.sync.getBlob?did=${user.did}&cid=${userChannel.avatar.ref}`
                    }
                    chats.push({
                        src_uri: data.chatRef.uri,
                        src: {
                            text,
                            stream: data.streamRef,
                        },
                        author: {
                            did: user.did,
                            handle: user.handle,
                            displayName: userChannel?.displayName,
                            avatar
                        },
                    })
                }
                await update({ reset: true })
            }
        }
    }

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
                    const msg = view as ChatView
                    let scroll = false
                    if (box) scroll = box.scrollTop === 0
                    let placed = false
                    chats.forEach((chat) => {
                        if (chat.src_uri === msg.src_uri) {
                            placed = true
                        }
                    })
                    if (!placed) chats.push(view as ChatView)
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

    const styles = {
        standard: [
            "lg:min-w-96 lg:w-96 md:min-w-full md:w-full border-neutral-500 border",
            "h-full flex flex-col",
            "grow h-64 flex flex-col-reverse overflow-auto overscroll-contain"
        ],
        popout: [
            "w-full h-screen flex border-neutral-500 border",
            "flex flex-col flex-grow",
            "grow flex flex-col-reverse overflow-auto overscroll-contain"
        ]
    }

</script>

<div class={styles[style][0]}>
    <div class={styles[style][1]}>
        <div id="chatbox" class={styles[style][2]}>
            <div>
            {#each chats as chat}
                <!-- TODO: Usercard on click -->
                <div class="px-2 min-w-0 text-wrap break-words line-clamp-6 flex flex-row justify-start items-center border-t border-gray-500">
                    {#if user && focus.did === user.did}
                        <div class="pr-2">
                            <form method="POST" enctype="multipart/form-data" action="/api/action?/ban" use:enhance>
                                <input type="hidden" name="did" id="did" value="{chat.author.did}">
                                <button class="text-red-500 hover:underline" id="ban" name="ban" title="Chat" placeholder="Say something...">Ban</button>
                            </form>
                        </div>
                    {/if}
                    <a class="size-8 shrink-0 rounded-full overflow-hidden m-1" href="/{chat.author.did}">
                        <img class="size-full" src="{ chat.author.avatar ? chat.author.avatar : "/nanashi.png" }" alt="{chat.author.handle}'s Profile Icon"/>
                    </a>
                    <p>&lt;<a href="/{chat.author.did}"><b>{chat.author.displayName ?? (chat.author.handle ? `@${chat.author.handle}` : chat.author.did)}</b></a>&gt;</p>
                    &nbsp;
                    <p class="{chat.phantom ? "opacity-50" : ""}">{chat.src.text}</p>
                </div>
            {/each}
            </div>
        </div>
        {#if user}
            <div class="place-content-end border-t border-neutral-500">
                <form method="POST" enctype="multipart/form-data" action="/api/action?/chat" use:enhance={submitFunction}>
                    <input type="hidden" name="did" id="did" value="{focus.did}">
                    <input type="hidden" name="rkey" id="rkey" value="{rkey}">
                    <input class="w-full bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" type="text" id="chat" name="chat" title="Chat" placeholder="Say something..."/>
                </form>
            </div>
        {/if}
    </div>
</div>
