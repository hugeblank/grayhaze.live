<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="box-border mx-auto px-8 max-w-7xl pb-8">
	{@render children()}
</div>
