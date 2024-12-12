<script lang="ts">
    import Link from "../../Link.svelte";

    const { items } = $props()
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-2.5 gap-y-5 ml-2 mr-2">
    {#each items as item}
            <div class="relative flex flex-col justify-end border rounded-[1em] border-solid border-gray-500 p-[1em] h-48">
                <p class="absolute top-4 leading-[1.5] pb-2 tworows">Record: <Link underline={true} to={item.to}>{item.rkey}</Link></p>
                <div>
                    <div class="absolute bottom-10 flex flex-grow max-w-screen-md h-8">
                        <input class="w-52 px-2 rounded-l-xl bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" id="searchbar" type="text" name="searchbar" placeholder="Title"/>
                        <button class="w-10 bg-neutral-600 hover:bg-neutral-500 rounded-r-xl content-center" aria-label="Search">
                            <i class="bi-search text-xl text-slate-300"></i>
                        </button>
                    </div>
                    <p class="text-gray-300 absolute bottom-4">{item.timestamp}</p>
                </div>
            </div>
    {/each}
</div>