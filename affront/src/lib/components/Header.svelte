<script lang="ts">
    import type { ATPUser } from "$lib/ATPUser";

    const { user, hide }: { user?: ATPUser, hide?: boolean} = $props()
    const name = user?.getName()
</script>

<div class="mx-auto px-8 max-w-screen-2xl">
    <header class="sticky mx-auto h-fit top-0 bg-[#0f0f0f] z-50">
        <div class="flex lg:flex-row flex-col justify-between items-center p-3">
            <!-- Maybe one day we'll have a logo -->
            <div>
                <a class="hover:underline" href="/"><h1>GrayHaze<sup class="-top-4 text-xs">ALPHA</sup></h1></a>
            </div>
            {#if !hide}
                <!-- <div class="flex mx-3 flex-grow max-w-screen-md h-11">
                    <input class="w-[90%] px-5 rounded-l-xl bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" id="searchbar" type="text" name="searchbar" placeholder={data.placeholder}/>
                    <button class="w-[10%] bg-neutral-600 hover:bg-neutral-500 rounded-r-xl content-center" aria-label="Search">
                        <i class="bi-search text-xl text-slate-300"></i>
                    </button>
                </div> -->
                <div>
                    {#if user}
                        <a class="hover:underline" href="/{name}"><h2>{name}</h2></a>
                    {:else}
                        <a class="hover:underline" href="/login"><h2>Log in</h2></a>
                    {/if}
                </div>
            {/if}
        </div>
    </header>
</div>