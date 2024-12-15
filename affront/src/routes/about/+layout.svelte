<script lang="ts">
	let { children } = $props();
</script>

<div class="mx-auto px-8 max-w-screen-2xl pb-8">
	{@render children()}
</div>