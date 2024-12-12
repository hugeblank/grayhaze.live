<script lang="ts">
    import { goto } from "$app/navigation";
    import { ATPUser } from "$lib/ATPUser";
    import ReactiveDetail from "$lib/components/ReactiveDetail.svelte";

    const style = "shadow bg-neutral-500 appearance-none placeholder:text-neutral-400 border rounded-xl w-full py-2 px-3 text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"

    let value = $state("")
    let clazz = $state(style)
    let entry1 = $state({
        ok: false,
        text: ""
    })
    let entry2 = $state({
        ok: false,
        text: ""
    })
    let user: ATPUser | undefined = $state(undefined);
    let timeout: ReturnType<typeof setTimeout> | undefined;

    function clear() {
        user = undefined
        entry2.text = ""
        entry1.text = ""
        clazz = style
    }

    function oninput() {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(async () => {
            if (value.length > 0 && (value.includes(":") || value.includes("."))) {
                let handle = value
                if (handle.startsWith("@")) handle = handle.substring(1)
                clear()
                try {
                    if (value.includes(":")) {
                        user = await ATPUser.fromDID(handle)
                    } else {
                        user = await ATPUser.fromHandle(handle)
                    }
                    const pds = user.getPDS()
                    if (pds) {
                        clazz = style + " border-green-500"
                        entry1.ok = true
                        if (pds?.endsWith("bsky.network")) {
                            entry2.ok = true
                            const split = pds?.split(".")
                            const mushroom = split[0].replace(/http[s]?:\/\//, "")
                            entry2.text = `🍄 ${mushroom.at(0)?.toLocaleUpperCase() + mushroom.substring(1)}`
                            entry1.text = `✨ of ${split[0].replace(mushroom, "")}bsky.network`
                        } else if (user.getDID().split(":")[1] === "web") {
                            entry2.ok = true
                            entry2.text = `🌐 did:web user!`
                        }
                        if (entry1.text.length === 0) {
                            entry1.text = `✨ of ${pds}`
                        }
                    } else {
                        clazz = style + " border-red-500"
                        entry1.ok = false
                        entry1.text = "No associated ATProto PDS"
                    }
                } catch {
                    clazz = style + " border-red-500"
                    entry1.ok = false
                    if (value.includes(":")) {
                        entry1.text = "No such DID"
                    } else {
                        entry1.text = "Could not resolve handle"
                    }
                }
            } else if (value.length == 0) {
                clear()
            }
        }, 400)
    }

    function onclick() {
        if (user) {
            goto(`/oauth/login?did=${user.getDID()}`)
        }
    }
</script>

<div class="w-full max-w-xs mx-auto">
    <form class="bg-neutral-700 shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-neutral-50 text-sm font-bold mb-2" for="username">
          Handle
        </label>
        <input {oninput} class={clazz} id="username" type="text" placeholder="@me.bsky.social" bind:value={value}>
        <div class="min-h-12 my-1">
            <ReactiveDetail { ...entry1}/>
            <ReactiveDetail { ...entry2}/>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <button {onclick} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-7 rounded-xl focus:outline-none focus:shadow-outline" type="button">
          Go
        </button>
        <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/about">
          What is this?
        </a>
      </div>
    </form>
  </div>