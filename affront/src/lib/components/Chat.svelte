<script lang="ts">
    import { enhance } from '$app/forms';

    interface ChatView {
        src_uri: string, // AT-URI
        src: {
            stream: {
                uri: string,
                cid: string
            },
            text: string,
            langs?: string[]
            // TODO: Incomplete, use lexicon when you fix them
        },
        author: {
            did: string, // DID
            handle?: string,
            displayName?: string,
            avatar?: string // AT-URI
        }
    }

    import {
		PUBLIC_SPRINKLER,
	} from '$env/static/public';
    import type { ATPUser } from '$lib/ATPUser';
    import { decode, decodeFirst } from '@atcute/cbor';
    import { onMount } from 'svelte';
    let { rkey, authed, user }: {rkey: string, authed: boolean, user: ATPUser} = $props();

    const chats: ChatView[] = $state([])
    onMount(() => {
        const ws = new WebSocket(`${PUBLIC_SPRINKLER}/xrpc/live.grayhaze.interaction.subscribeChat?stream=${rkey}&did=${user.did}`)
        ws.onopen = () => {
            console.log("chat socket: subscription")
        }
        ws.onclose = () => {
            console.log("chat socket: closed")
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
            const [ header , data ] = decodeFirst(new Uint8Array(await e.data.arrayBuffer()))
            if (header['op'] === 1) {
                chats.push(decode(data as Uint8Array) as ChatView)
            }
        }
    })

</script>

<div class="lg:min-w-96 md:min-w-full border-neutral-500 border">
    <div class="h-full flex flex-col">
        <div class="px-2 grow min-h-64">
        {#each chats as chat}
            <!-- TODO: Usercard on click -->
            <p>&lt;<a href="/{chat.author.did}"><b>{chat.author.displayName ?? chat.author.handle ? `@${chat.author.handle}` : chat.author.did}</b></a>&gt; {chat.src.text}</p>
        {/each}
        </div>
        {#if authed}
            <div class="place-content-end border-t border-neutral-500">
                <form method="POST" enctype="multipart/form-data" action="?/chat" use:enhance>
                    <input class="w-full bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" type="text" id="chat" name="chat" title="Chat" placeholder="Say something..."/>
                </form>
            </div>
        {/if}
    </div>
</div>