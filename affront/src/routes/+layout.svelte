<script lang="ts">
    import { ATPUser } from '$lib/ATPUser';
	import '../app.css';
	let { children, data } = $props();

	const user = data.diddoc ? ATPUser.fromDIDDoc(data.diddoc) : undefined
	const handle = user?.handle
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

</svelte:head>

<header class="mx-auto px-8 pb-4 max-w-screen-2xl">
	<div class="flex justify-between items-center m-3">
		<!-- Maybe one day we'll have a logo -->
		<a class="hover:underline" href="/"><h1>GrayHaze</h1></a>
		<!-- <div class="flex mx-3 flex-grow max-w-screen-md h-11">
			<input class="w-[90%] px-5 rounded-l-xl bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 placeholder:text-neutral-500 border-none focus:shadow-none focus:ring-transparent" id="searchbar" type="text" name="searchbar" placeholder={data.placeholder}/>
			<button class="w-[10%] bg-neutral-600 hover:bg-neutral-500 rounded-r-xl content-center" aria-label="Search">
				<i class="bi-search text-xl text-slate-300"></i>
			</button>
		</div> -->
		{#if user}
			<a href="/@{handle}"><h2>@{handle}</h2></a>
		{:else}
			<a href="/login"><h2>Log in</h2></a>
		{/if}
	</div>
</header>
{@render children()}
<footer class="mx-auto">
	<p class="text-center">Patent Pending: User-Unfriendly Interface</p>
</footer>