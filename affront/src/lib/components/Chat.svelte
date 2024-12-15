<script lang="ts">
    interface ChatView {
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
    import { decode, decodeFirst } from '@atcute/cbor';
    import { onMount } from 'svelte';
    let { rkey } = $props();

    const chats: ChatView[] = $state([])
    onMount(() => {
        const ws = new WebSocket(`${PUBLIC_SPRINKLER}/xrpc/live.grayhaze.interaction.subscribeChat?stream=${rkey}`)
        ws.onopen = () => {
            console.log("subscription")
            console.log(`${PUBLIC_SPRINKLER}/xrpc/live.grayhaze.interaction.subscribeChat?stream=${rkey}`)
        }
        ws.onclose = () => {
            console.log("closed")
        }
        ws.onerror = () => {
            console.log("errored")
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

        window.onbeforeunload = function() {
            ws.onclose = function () {}; // disable onclose handler first
            ws.close();
            console.log("byebye")
        };
    })

</script>

<div class="w-96 min-w-96">
    {#each chats as chat}
        <!-- TODO: Usercard on click -->
        <p>&lt;<a href="/{chat.author.did}"><b>{chat.author.displayName ?? chat.author.handle ? `@${chat.author.handle}` : chat.author.did}</b></a>&gt; {chat.src.text}</p>
    {/each}
</div>